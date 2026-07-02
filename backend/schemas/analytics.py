from pydantic import BaseModel
from typing import List


class AnalyticsSummary(BaseModel):
    total_chats: int
    total_sessions: int
    total_users: int
    total_documents: int
    today_chats: int
    monthly_chats: int
    avg_response_time_ms: float
    helpful_feedback_pct: float
    not_helpful_feedback_pct: float
    positive_pct: float
    negative_pct: float
    knowledge_coverage: float


class CategoryBreakdown(BaseModel):
    category: str
    count: int
    percentage: float


class SentimentBreakdown(BaseModel):
    sentiment: str
    count: int
    percentage: float


class DailyStats(BaseModel):
    date: str
    chat_count: int


class TopQuestion(BaseModel):
    question: str
    count: int


class FailedQuery(BaseModel):
    query: str
    count: int


class AnalyticsResponse(BaseModel):
    summary: AnalyticsSummary
    category_breakdown: List[CategoryBreakdown]
    sentiment_breakdown: List[SentimentBreakdown]
    daily_stats: List[DailyStats]
    weekly_stats: List[DailyStats]
    monthly_stats: List[DailyStats]
    hourly_stats: List[DailyStats]
    top_questions: List[TopQuestion]
    top_failed_queries: List[FailedQuery]
    feedback_rating: float
