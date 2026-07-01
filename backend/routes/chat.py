import uuid
import time
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database.database import get_db
from database import models
from schemas.chat import ChatRequest, ChatResponse, FeedbackRequest, HistorySearchRequest
from core.dependencies import get_current_user
from services.embedding_service import search_similar
from services.llm_service import generate_response, classify_issue, detect_sentiment

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = logging.getLogger(__name__)


def build_history(messages: list, limit: int = 6) -> str:
    recent = messages[-limit:] if len(messages) > limit else messages
    history = ""
    for m in recent:
        role = "Customer" if m.role == "user" else "Assistant"
        history += f"{role}: {m.content}\n"
    return history.strip()


@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    company = db.query(models.Company).filter(models.Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=400, detail="Company not found")

    # Get or create session
    session_id = request.session_id or str(uuid.uuid4())
    session = db.query(models.ChatSession).filter(models.ChatSession.session_id == session_id).first()
    if not session:
        session = models.ChatSession(
            session_id=session_id,
            company_id=company.id,
            user_id=current_user.id,
            customer_name=request.customer_name,
            customer_email=request.customer_email,
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # Get conversation history
    prev_messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.session_id == session_id
    ).order_by(models.ChatMessage.created_at).all()
    history = build_history(prev_messages)

    # RAG: get relevant context
    docs = search_similar(company.id, request.message, k=4)
    context = "\n\n".join([d.page_content for d in docs])
    sources = list({d.metadata.get("source", "") for d in docs if d.metadata.get("source")})

    # Classify and detect sentiment
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

    # Generate response
    start = time.time()
    try:
        answer = generate_response(
            company_name=company.name,
            context=context,
            history=history,
            question=request.message,
        )
    except Exception as e:
        logger.error(f"LLM error: {e}")
        answer = "I'm experiencing technical difficulties. Please try again shortly."

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

    return ChatResponse(
        session_id=session_id,
        message_id=assistant_msg.id,
        answer=answer,
        category=category,
        sentiment=sentiment,
        response_time_ms=response_time_ms,
        sources=sources,
    )


@router.post("/feedback")
def submit_feedback(
    request: FeedbackRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if request.feedback not in ["helpful", "not_helpful"]:
        raise HTTPException(status_code=400, detail="Feedback must be 'helpful' or 'not_helpful'")

    msg = db.query(models.ChatMessage).filter(models.ChatMessage.id == request.message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    msg.feedback = request.feedback
    db.commit()
    return {"status": "ok", "message_id": request.message_id, "feedback": request.feedback}


@router.get("/history/sessions")
def get_sessions(
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    total = db.query(models.ChatSession).filter(
        models.ChatSession.company_id == current_user.company_id
    ).count()
    sessions = (
        db.query(models.ChatSession)
        .filter(models.ChatSession.company_id == current_user.company_id)
        .order_by(models.ChatSession.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {"total": total, "page": page, "page_size": page_size, "sessions": [
        {
            "id": s.id,
            "session_id": s.session_id,
            "customer_name": s.customer_name,
            "customer_email": s.customer_email,
            "is_active": s.is_active,
            "message_count": db.query(models.ChatMessage).filter(models.ChatMessage.session_id == s.session_id).count(),
            "created_at": s.created_at,
        } for s in sessions
    ]}


@router.get("/history/sessions/{session_id}")
def get_session_messages(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = db.query(models.ChatSession).filter(
        models.ChatSession.session_id == session_id,
        models.ChatSession.company_id == current_user.company_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.session_id == session_id
    ).order_by(models.ChatMessage.created_at).all()

    return {
        "session_id": session_id,
        "customer_name": session.customer_name,
        "customer_email": session.customer_email,
        "created_at": session.created_at,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "category": m.category,
                "sentiment": m.sentiment,
                "feedback": m.feedback,
                "response_time_ms": m.response_time_ms,
                "created_at": m.created_at,
            } for m in messages
        ]
    }


@router.get("/history/search")
def search_history(
    query: str = "",
    sentiment: str = None,
    category: str = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    base_q = (
        db.query(models.ChatMessage)
        .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
        .filter(models.ChatSession.company_id == current_user.company_id)
        .filter(models.ChatMessage.role == "user")
    )
    if query:
        base_q = base_q.filter(models.ChatMessage.content.ilike(f"%{query}%"))
    if sentiment:
        base_q = base_q.filter(models.ChatMessage.sentiment == sentiment)
    if category:
        base_q = base_q.filter(models.ChatMessage.category == category)

    total = base_q.count()
    messages = base_q.order_by(models.ChatMessage.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "messages": [
            {
                "id": m.id,
                "session_id": m.session_id,
                "content": m.content,
                "category": m.category,
                "sentiment": m.sentiment,
                "created_at": m.created_at,
            } for m in messages
        ]
    }
