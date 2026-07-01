import re
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from database import models
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse, CompanyResponse
from core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check email exists
    if db.query(models.User).filter(models.User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Validate slug
    if not re.match(r'^[a-z0-9-]+$', request.company_slug):
        raise HTTPException(status_code=400, detail="Slug must contain only lowercase letters, numbers, and hyphens")

    if db.query(models.Company).filter(models.Company.slug == request.company_slug).first():
        raise HTTPException(status_code=400, detail="Company slug already taken")

    # Create company
    company = models.Company(
        name=request.company_name,
        slug=request.company_slug,
    )
    db.add(company)
    db.flush()

    # Create user
    user = models.User(
        email=request.email,
        full_name=request.full_name,
        hashed_password=hash_password(request.password),
        role="company_admin",
        company_id=company.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.refresh(company)

    token = create_access_token({"sub": str(user.id), "company_id": company.id, "role": user.role})

    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "company_id": user.company_id,
            "company_name": company.name,
            "company_slug": company.slug,
        }
    )


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    company = db.query(models.Company).filter(models.Company.id == user.company_id).first()

    token = create_access_token({"sub": str(user.id), "company_id": user.company_id, "role": user.role})

    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "company_id": user.company_id,
            "company_name": company.name if company else None,
            "company_slug": company.slug if company else None,
        }
    )


@router.get("/me", response_model=UserResponse)
def get_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(__import__("core.dependencies", fromlist=["get_current_user"]).get_current_user)
):
    return current_user
