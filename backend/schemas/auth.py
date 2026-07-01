from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class CompanyCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    website: Optional[str] = None

    @field_validator("slug")
    @classmethod
    def slug_must_be_valid(cls, v):
        import re
        if not re.match(r'^[a-z0-9-]+$', v):
            raise ValueError("Slug must contain only lowercase letters, numbers, and hyphens")
        return v


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    company_name: str
    company_slug: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    company_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class CompanyResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    website: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
