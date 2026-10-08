import time
import logging
from google import genai
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable, InternalServerError
from core.config import settings

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

# ── Retry config ──────────────────────────────────────────────────────────────
MAX_RETRIES   = 3          # total attempts
RETRY_BACKOFF = [1, 2, 4]  # seconds to wait before attempt 2, 3, 4

# HTTP status codes / exception types that are safe to retry
_RETRYABLE_STATUSES = {429, 503, 500, 502, 504}

SYSTEM_PROMPT = """You are a helpful AI customer support assistant for {company_name}.

STRICT RULES:
1. Answer ONLY based on the provided company knowledge base context.
2. If the answer is not in the context, say: "I don't have information about that in our knowledge base. Please contact our support team."
3. Never make up information or hallucinate facts.
4. Be professional, concise, and friendly.
5. Use bullet points for lists. Keep responses clear and easy to read.

Company Knowledge Base:
{context}

Conversation History:
{history}
"""


def build_prompt(company_name, context, history, question):
    system = SYSTEM_PROMPT.format(
        company_name=company_name,
        context=context if context else "No relevant documents found.",
        history=history if history else "No previous conversation.",
    )
    return f"{system}\n\nCustomer Question: {question}\n\nAnswer:"


def _is_retryable(exc: Exception) -> bool:
    """Return True if the exception is a transient error worth retrying."""
    # google-api-core typed exceptions
    if isinstance(exc, (ResourceExhausted, ServiceUnavailable, InternalServerError)):
        return True
    # Fall back to string matching for any other wrapper exceptions
    msg = str(exc).lower()
    return any(
        token in msg
        for token in ("503", "429", "502", "504", "unavailable", "quota", "overload", "rate limit")
    )


def generate_response(company_name, context, history, question):
    """
    Call Gemini and return the response text.
    Automatically retries up to MAX_RETRIES times on transient 503/429 errors
    using exponential backoff before giving up.
    """
    prompt = build_prompt(company_name, context, history, question)
    last_exc = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
            )
            if attempt > 1:
                logger.info("LLM call succeeded on attempt %d", attempt)
            return response.text.strip()

        except Exception as exc:
            last_exc = exc
            if _is_retryable(exc) and attempt < MAX_RETRIES:
                wait = RETRY_BACKOFF[attempt - 1]
                logger.warning(
                    "LLM transient error (attempt %d/%d), retrying in %ds: %s",
                    attempt, MAX_RETRIES, wait, exc,
                )
                time.sleep(wait)
            else:
                # Non-retryable error OR final attempt — log and re-raise
                logger.error("LLM generation error (attempt %d/%d): %s", attempt, MAX_RETRIES, exc)
                raise

    # Should never reach here, but just in case
    raise last_exc


def classify_issue(question):
    cats = {
        "Billing":      ["refund", "payment", "invoice", "charge", "billing", "subscription"],
        "Shipping":     ["delivery", "shipping", "track", "order", "dispatch", "courier"],
        "Technical":    ["login", "error", "bug", "crash", "not working", "issue", "problem"],
        "Account":      ["account", "profile", "password", "email", "username", "register"],
        "Product":      ["product", "feature", "how to", "how do", "guide", "tutorial"],
        "Cancellation": ["cancel", "cancellation", "unsubscribe", "close account"],
    }
    q = question.lower()
    for cat, kws in cats.items():
        if any(kw in q for kw in kws):
            return cat
    return "General"


def detect_sentiment(question):
    neg = ["bad", "angry", "terrible", "awful", "hate", "problem", "issue",
           "failed", "broken", "worst", "horrible"]
    pos = ["great", "excellent", "amazing", "love", "perfect", "awesome",
           "wonderful", "happy", "satisfied", "thank"]
    q  = question.lower()
    nc = sum(1 for w in neg if w in q)
    pc = sum(1 for w in pos if w in q)
    if nc > pc:
        return "Negative"
    elif pc > nc:
        return "Positive"
    return "Neutral"
