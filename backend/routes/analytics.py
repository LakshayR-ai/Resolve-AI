import io
import csv
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database.database import get_db
from database import models
from schemas.analytics import AnalyticsResponse
from core.dependencies import get_current_user
from services.analytics_service import get_analytics

router = APIRouter(prefix="/analytics", tags=["Analytics"])
logger = logging.getLogger(__name__)


@router.get("/", response_model=AnalyticsResponse)
def get_company_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="No company associated")
    return get_analytics(db, current_user.company_id)


@router.get("/export/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    messages = (
        db.query(models.ChatMessage)
        .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
        .filter(models.ChatSession.company_id == current_user.company_id)
        .order_by(models.ChatMessage.created_at.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Session ID", "Role", "Content", "Category", "Sentiment", "Feedback", "Response Time (ms)", "Created At"])
    for m in messages:
        writer.writerow([
            m.id, m.session_id, m.role, m.content,
            m.category or "", m.sentiment or "",
            m.feedback or "", m.response_time_ms or "",
            m.created_at.isoformat() if m.created_at else ""
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=chat_history.csv"}
    )


@router.get("/export/json")
def export_json(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    messages = (
        db.query(models.ChatMessage)
        .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
        .filter(models.ChatSession.company_id == current_user.company_id)
        .all()
    )

    data = [
        {
            "id": m.id,
            "session_id": m.session_id,
            "role": m.role,
            "content": m.content,
            "category": m.category,
            "sentiment": m.sentiment,
            "feedback": m.feedback,
            "response_time_ms": m.response_time_ms,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        } for m in messages
    ]

    import json
    json_str = json.dumps(data, indent=2)
    return StreamingResponse(
        iter([json_str]),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=chat_history.json"}
    )
