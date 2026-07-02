"""
Public chatbot widget route — no authentication required.
Customers access this via /widget/{company_slug}
"""
import uuid
import time
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database.database import get_db
from database import models
from services.embedding_service import search_similar
from services.llm_service import generate_response, classify_issue, detect_sentiment

router = APIRouter(prefix="/widget", tags=["Public Widget"])
logger = logging.getLogger(__name__)


class WidgetChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None


class WidgetChatResponse(BaseModel):
    session_id: str
    message_id: int
    answer: str
    response_time_ms: int


def build_history(messages: list, limit: int = 6) -> str:
    recent = messages[-limit:] if len(messages) > limit else messages
    history = ""
    for m in recent:
        role = "Customer" if m.role == "user" else "Assistant"
        history += f"{role}: {m.content}\n"
    return history.strip()


@router.get("/{slug}/info")
def get_widget_info(slug: str, db: Session = Depends(get_db)):
    """Returns public company info for rendering the widget."""
    company = db.query(models.Company).filter(
        models.Company.slug == slug,
        models.Company.is_active == True
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail="Chatbot not found or inactive")

    doc_count = db.query(models.Document).filter(
        models.Document.company_id == company.id,
        models.Document.status == "ready"
    ).count()

    return {
        "company_name": company.name,
        "slug": company.slug,
        "description": company.description,
        "logo_url": company.logo_url,
        "has_knowledge_base": doc_count > 0,
        "welcome_message": f"Hi! I'm {company.name}'s AI assistant. How can I help you today?",
    }


@router.post("/{slug}/chat", response_model=WidgetChatResponse)
def widget_chat(slug: str, request: WidgetChatRequest, db: Session = Depends(get_db)):
    """Public chat endpoint — no JWT required. Accessed by end customers."""
    company = db.query(models.Company).filter(
        models.Company.slug == slug,
        models.Company.is_active == True
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail="Chatbot not found or inactive")

    # Basic input validation
    if not request.message or len(request.message.strip()) < 1:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if len(request.message) > 2000:
        raise HTTPException(status_code=400, detail="Message too long (max 2000 characters)")

    # Get or create session
    session_id = request.session_id or str(uuid.uuid4())
    session = db.query(models.ChatSession).filter(models.ChatSession.session_id == session_id).first()
    if not session:
        session = models.ChatSession(
            session_id=session_id,
            company_id=company.id,
            user_id=None,
            customer_name=request.customer_name,
            customer_email=request.customer_email,
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # Conversation history
    prev_messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.session_id == session_id
    ).order_by(models.ChatMessage.created_at).all()
    history = build_history(prev_messages)

    # RAG search
    docs = search_similar(company.id, request.message, k=4)
    context = "\n\n".join([d.page_content for d in docs])

    # Classify + sentiment
    category = classify_issue(request.message)
    sentiment = detect_sentiment(request.message)

    # Store user message
    user_msg = models.ChatMessage(
        session_id=session_id,
        role="user",
        content=request.message,
        category=category,
        sentiment=sentiment,
    )
    db.add(user_msg)
    db.commit()

    # Generate AI response
    start = time.time()
    try:
        answer = generate_response(
            company_name=company.name,
            context=context,
            history=history,
            question=request.message,
        )
    except Exception as e:
        logger.error(f"Widget LLM error for {slug}: {e}")
        answer = "I'm sorry, I'm having trouble responding right now. Please try again in a moment."

    response_time_ms = int((time.time() - start) * 1000)

    # Store assistant message
    assistant_msg = models.ChatMessage(
        session_id=session_id,
        role="assistant",
        content=answer,
        response_time_ms=response_time_ms,
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return WidgetChatResponse(
        session_id=session_id,
        message_id=assistant_msg.id,
        answer=answer,
        response_time_ms=response_time_ms,
    )


@router.post("/{slug}/feedback")
def widget_feedback(
    slug: str,
    message_id: int,
    feedback: str,
    db: Session = Depends(get_db)
):
    """Public feedback endpoint — customers can rate responses."""
    if feedback not in ["helpful", "not_helpful"]:
        raise HTTPException(status_code=400, detail="Feedback must be 'helpful' or 'not_helpful'")

    msg = db.query(models.ChatMessage).filter(models.ChatMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    msg.feedback = feedback
    db.commit()
    return {"status": "ok"}
