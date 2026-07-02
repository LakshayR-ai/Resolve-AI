import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database.database import get_db
from database import models
from core.dependencies import get_current_user

router = APIRouter(prefix="/company", tags=["Company"])
logger = logging.getLogger(__name__)


class CompanyUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None


class EmbedConfigResponse(BaseModel):
    company_id: int
    company_name: str
    slug: str
    embed_url: str
    script_tag: str


@router.get("/profile")
def get_company_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    company = db.query(models.Company).filter(models.Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    doc_count = db.query(models.Document).filter(models.Document.company_id == company.id).count()
    ready_docs = db.query(models.Document).filter(
        models.Document.company_id == company.id,
        models.Document.status == "ready"
    ).count()
    total_chats = (
        db.query(models.ChatMessage)
        .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
        .filter(models.ChatSession.company_id == company.id, models.ChatMessage.role == "user")
        .count()
    )

    return {
        "id": company.id,
        "name": company.name,
        "slug": company.slug,
        "description": company.description,
        "website": company.website,
        "logo_url": company.logo_url,
        "is_active": company.is_active,
        "created_at": company.created_at,
        "stats": {
            "total_documents": doc_count,
            "ready_documents": ready_docs,
            "total_chats": total_chats,
        }
    }


@router.patch("/profile")
def update_company_profile(
    request: CompanyUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ["company_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Only company admins can update the profile")

    company = db.query(models.Company).filter(models.Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    if request.name is not None:
        company.name = request.name
    if request.description is not None:
        company.description = request.description
    if request.website is not None:
        company.website = request.website
    if request.logo_url is not None:
        company.logo_url = request.logo_url

    db.commit()
    db.refresh(company)
    return {"message": "Profile updated", "company": {"id": company.id, "name": company.name, "slug": company.slug}}


@router.get("/embed-config")
def get_embed_config(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    company = db.query(models.Company).filter(models.Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    embed_url = f"http://localhost:3000/widget/{company.slug}"
    script_tag = f'<script src="http://localhost:3000/embed.js" data-company="{company.slug}" defer></script>'

    return {
        "company_id": company.id,
        "company_name": company.name,
        "slug": company.slug,
        "embed_url": embed_url,
        "script_tag": script_tag,
        "iframe_embed": f'<iframe src="{embed_url}" width="400" height="600" frameborder="0"></iframe>',
    }


@router.get("/team")
def get_team(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    members = db.query(models.User).filter(models.User.company_id == current_user.company_id).all()
    return {
        "total": len(members),
        "members": [
            {
                "id": m.id,
                "full_name": m.full_name,
                "email": m.email,
                "role": m.role,
                "is_active": m.is_active,
                "created_at": m.created_at,
            } for m in members
        ]
    }
