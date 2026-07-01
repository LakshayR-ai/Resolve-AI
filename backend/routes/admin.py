import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from database import models
from core.dependencies import get_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = logging.getLogger(__name__)


@router.get("/companies")
def list_companies(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_admin_user),
):
    companies = db.query(models.Company).all()
    return {"total": len(companies), "companies": [
        {
            "id": c.id, "name": c.name, "slug": c.slug,
            "is_active": c.is_active, "created_at": c.created_at,
            "user_count": db.query(models.User).filter(models.User.company_id == c.id).count(),
            "document_count": db.query(models.Document).filter(models.Document.company_id == c.id).count(),
            "chat_count": db.query(models.ChatSession).filter(models.ChatSession.company_id == c.id).count(),
        } for c in companies
    ]}


@router.patch("/companies/{company_id}/toggle")
def toggle_company(
    company_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_admin_user),
):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_active = not company.is_active
    db.commit()
    return {"id": company_id, "is_active": company.is_active}


@router.get("/stats")
def platform_stats(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_admin_user),
):
    return {
        "total_companies": db.query(models.Company).count(),
        "total_users": db.query(models.User).count(),
        "total_documents": db.query(models.Document).count(),
        "total_sessions": db.query(models.ChatSession).count(),
        "total_messages": db.query(models.ChatMessage).count(),
    }
