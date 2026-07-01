from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None


class ChatResponse(BaseModel):
    session_id: str
    message_id: int
    answer: str
    category: str
    sentiment: str
    response_time_ms: int
    sources: List[str] = []


class FeedbackRequest(BaseModel):
    message_id: int
    feedback: str  # "helpful" or "not_helpful"


class MessageResponse(BaseModel):
    id: int
    session_id: str
    role: str
    content: str
    category: Optional[str]
    sentiment: Optional[str]
    feedback: Optional[str]
    response_time_ms: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class SessionResponse(BaseModel):
    id: int
    session_id: str
    customer_name: Optional[str]
    customer_email: Optional[str]
    is_active: bool
    created_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True


class HistorySearchRequest(BaseModel):
    query: Optional[str] = None
    sentiment: Optional[str] = None
    category: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    page: int = 1
    page_size: int = 20
