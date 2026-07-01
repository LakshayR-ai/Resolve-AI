import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from database import models
from schemas.analytics import (
    AnalyticsSummary, CategoryBreakdown, SentimentBreakdown,
    DailyStats, TopQuestion, FailedQuery, AnalyticsResponse
)

logger = logging.getLogger(__name__)


def get_analytics(db: Session, company_id: int) -> AnalyticsResponse:
    # Base queries
    messages_q = (
        db.query(models.ChatMessage)
        .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
        .filter(models.ChatSession.company_id == company_id)
    )
    user_messages = messages_q.filter(models.ChatMessage.role == "user")
    assistant_messages = messages_q.filter(models.ChatMessage.role == "assistant")

    total_chats = user_messages.count()
    total_sessions = db.query(models.ChatSession).filter(models.ChatSession.company_id == company_id).count()
    total_users = db.query(models.User).filter(models.User.company_id == company_id).count()
    total_documents = db.query(models.Document).filter(models.Document.company_id == company_id).count()

    # Avg response time
    avg_rt = assistant_messages.with_entities(func.avg(models.ChatMessage.response_time_ms)).scalar() or 0.0

    # Feedback
    total_feedback = messages_q.filter(models.ChatMessage.feedback.isnot(None)).count()
    helpful = messages_q.filter(models.ChatMessage.feedback == "helpful").count()
    not_helpful = messages_q.filter(models.ChatMessage.feedback == "not_helpful").count()
    helpful_pct = (helpful / total_feedback * 100) if total_feedback > 0 else 0.0
    not_helpful_pct = (not_helpful / total_feedback * 100) if total_feedback > 0 else 0.0
    feedback_rating = helpful_pct / 100.0

    summary = AnalyticsSummary(
        total_chats=total_chats,
        total_sessions=total_sessions,
        total_users=total_users,
        total_documents=total_documents,
        avg_response_time_ms=round(avg_rt, 2),
        helpful_feedback_pct=round(helpful_pct, 2),
        not_helpful_feedback_pct=round(not_helpful_pct, 2),
    )

    # Categories
    cat_rows = (
        user_messages.with_entities(models.ChatMessage.category, func.count().label("cnt"))
        .group_by(models.ChatMessage.category).all()
    )
    cat_total = sum(r.cnt for r in cat_rows) or 1
    category_breakdown = [
        CategoryBreakdown(category=r.category or "General", count=r.cnt, percentage=round(r.cnt / cat_total * 100, 2))
        for r in cat_rows
    ]

    # Sentiments
    sent_rows = (
        user_messages.with_entities(models.ChatMessage.sentiment, func.count().label("cnt"))
        .group_by(models.ChatMessage.sentiment).all()
    )
    sent_total = sum(r.cnt for r in sent_rows) or 1
    sentiment_breakdown = [
        SentimentBreakdown(sentiment=r.sentiment or "Neutral", count=r.cnt, percentage=round(r.cnt / sent_total * 100, 2))
        for r in sent_rows
    ]

    daily_stats = _get_time_series(db, company_id, days=30)
    weekly_stats = _get_weekly_series(db, company_id, weeks=12)
    monthly_stats = _get_monthly_series(db, company_id, months=12)

    # Top questions
    top_q = (
        user_messages.with_entities(models.ChatMessage.content, func.count().label("cnt"))
        .group_by(models.ChatMessage.content)
        .order_by(desc("cnt")).limit(10).all()
    )
    top_questions = [TopQuestion(question=r.content[:100], count=r.cnt) for r in top_q]

    # Failed queries (short answers = likely no context found)
    failed_q = (
        messages_q.filter(
            models.ChatMessage.role == "assistant",
            models.ChatMessage.content.like("%don't have information%")
        )
        .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
        .limit(10).all()
    )
    top_failed = [FailedQuery(query=m.content[:100], count=1) for m in failed_q]

    return AnalyticsResponse(
        summary=summary,
        category_breakdown=category_breakdown,
        sentiment_breakdown=sentiment_breakdown,
        daily_stats=daily_stats,
        weekly_stats=weekly_stats,
        monthly_stats=monthly_stats,
        top_questions=top_questions,
        top_failed_queries=top_failed,
        feedback_rating=round(feedback_rating, 2),
    )


def _get_time_series(db: Session, company_id: int, days: int) -> list:
    result = []
    for i in range(days - 1, -1, -1):
        day = (datetime.utcnow() - timedelta(days=i)).date()
        count = (
            db.query(models.ChatMessage)
            .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
            .filter(
                models.ChatSession.company_id == company_id,
                models.ChatMessage.role == "user",
                func.date(models.ChatMessage.created_at) == day
            ).count()
        )
        result.append(DailyStats(date=str(day), chat_count=count))
    return result


def _get_weekly_series(db: Session, company_id: int, weeks: int) -> list:
    result = []
    for i in range(weeks - 1, -1, -1):
        week_start = (datetime.utcnow() - timedelta(weeks=i)).date()
        week_end = week_start + timedelta(days=7)
        count = (
            db.query(models.ChatMessage)
            .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
            .filter(
                models.ChatSession.company_id == company_id,
                models.ChatMessage.role == "user",
                func.date(models.ChatMessage.created_at) >= week_start,
                func.date(models.ChatMessage.created_at) < week_end,
            ).count()
        )
        result.append(DailyStats(date=str(week_start), chat_count=count))
    return result


def _get_monthly_series(db: Session, company_id: int, months: int) -> list:
    result = []
    for i in range(months - 1, -1, -1):
        d = datetime.utcnow().replace(day=1) - timedelta(days=i * 30)
        month_label = d.strftime("%Y-%m")
        count = (
            db.query(models.ChatMessage)
            .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
            .filter(
                models.ChatSession.company_id == company_id,
                models.ChatMessage.role == "user",
                func.strftime("%Y-%m", models.ChatMessage.created_at) == month_label,
            ).count()
        )
        result.append(DailyStats(date=month_label, chat_count=count))
    return result
