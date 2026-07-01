import logging
from google import genai
from core.config import settings

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are a helpful AI customer support assistant for {company_name}.

STRICT RULES:
1. Answer ONLY based on the provided company knowledge base context.
2. If the answer is not in the context, say: "I don t have information about that in our knowledge base. Please contact our support team."
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


def generate_response(company_name, context, history, question):
    prompt = build_prompt(company_name, context, history, question)
    try:
        response = client.models.generate_content(model=settings.GEMINI_MODEL, contents=prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"LLM generation error: {e}")
        raise


def classify_issue(question):
    cats = {
        "Billing": ["refund", "payment", "invoice", "charge", "billing", "subscription"],
        "Shipping": ["delivery", "shipping", "track", "order", "dispatch", "courier"],
        "Technical": ["login", "error", "bug", "crash", "not working", "issue", "problem"],
        "Account": ["account", "profile", "password", "email", "username", "register"],
        "Product": ["product", "feature", "how to", "how do", "guide", "tutorial"],
        "Cancellation": ["cancel", "cancellation", "unsubscribe", "close account"],
    }
    q = question.lower()
    for cat, kws in cats.items():
        if any(kw in q for kw in kws):
            return cat
    return "General"


def detect_sentiment(question):
    neg = ["bad","angry","terrible","awful","hate","problem","issue","failed","broken","worst","horrible"]
    pos = ["great","excellent","amazing","love","perfect","awesome","wonderful","happy","satisfied","thank"]
    q = question.lower()
    nc = sum(1 for w in neg if w in q)
    pc = sum(1 for w in pos if w in q)
    if nc > pc:
        return "Negative"
    elif pc > nc:
        return "Positive"
    return "Neutral"
