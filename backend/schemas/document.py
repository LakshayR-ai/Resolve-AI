from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    file_type: str
    file_size: int
    status: str
    chunk_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    total: int
    documents: list[DocumentResponse]
