import logging
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from database import models
from schemas.analytics import (
    AnalyticsSummary, CategoryBreakdown, SentimentBreakdown,
    DailyStats, TopQuestion, FailedQuery, AnalyticsResponse
)

logger = logging.getLogger(__name__)


def get_analytics(db: Session, company_id: int) -> AnalyticsResponse:
    # ── Base query helpers ──────────────────────────────────────────
    def msg_q():
        return (
            db.query(models.ChatMessage)
            .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
            .filter(models.ChatSession.company_id == company_id)
        )

    user_msgs   = msg_q().filter(models.ChatMessage.role == "user")
    asst_msgs   = msg_q().filter(models.ChatMessage.role == "assistant")

    # ── Core counts ────────────────────────────────────────────────
    total_chats    = user_msgs.count()
    total_sessions = db.query(models.ChatSession).filter(models.ChatSession.company_id == company_id).count()
    total_users    = db.query(models.User).filter(models.User.company_id == company_id).count()
    total_docs     = db.query(models.Document).filter(models.Document.company_id == company_id).count()
    ready_docs     = db.query(models.Document).filter(
        models.Document.company_id == company_id,
        models.Document.status == "ready"
    ).count()

    today_str   = date.today().isoformat()
    month_str   = datetime.utcnow().strftime("%Y-%m")

    today_chats = user_msgs.filter(
        func.date(models.ChatMessage.created_at) == today_str
    ).count()

    monthly_chats = user_msgs.filter(
        func.strftime("%Y-%m", models.ChatMessage.created_at) == month_str
    ).count()

    # ── Response time ───────────────────────────────────────────────
    avg_rt = asst_msgs.with_entities(func.avg(models.ChatMessage.response_time_ms)).scalar() or 0.0

    # ── Feedback ────────────────────────────────────────────────────
    total_fb     = msg_q().filter(models.ChatMessage.feedback.isnot(None)).count()
    helpful      = msg_q().filter(models.ChatMessage.feedback == "helpful").count()
    not_helpful  = msg_q().filter(models.ChatMessage.feedback == "not_helpful").count()
    helpful_pct  = (helpful / total_fb * 100)     if total_fb > 0 else 0.0
    not_help_pct = (not_helpful / total_fb * 100) if total_fb > 0 else 0.0

    # ── Sentiments ──────────────────────────────────────────────────
    sent_rows = (
        user_msgs.with_entities(models.ChatMessage.sentiment, func.count().label("cnt"))
        .group_by(models.ChatMessage.sentiment).all()
    )
    sent_total = sum(r.cnt for r in sent_rows) or 1
    sentiment_breakdown = [
        SentimentBreakdown(
            sentiment=r.sentiment or "Neutral",
            count=r.cnt,
            percentage=round(r.cnt / sent_total * 100, 2)
        ) for r in sent_rows
    ]
    positive_pct = next(
        (r.cnt / sent_total * 100 for r in sent_rows if r.sentiment == "Positive"), 0.0
    )
    negative_pct = next(
        (r.cnt / sent_total * 100 for r in sent_rows if r.sentiment == "Negative"), 0.0
    )

    # Knowledge coverage = % of docs that are ready
    knowledge_coverage = round((ready_docs / total_docs * 100) if total_docs > 0 else 0.0, 1)

    # ── Summary ─────────────────────────────────────────────────────
    summary = AnalyticsSummary(
        total_chats=total_chats,
        total_sessions=total_sessions,
        total_users=total_users,
        total_documents=total_docs,
        today_chats=today_chats,
        monthly_chats=monthly_chats,
        avg_response_time_ms=round(avg_rt, 2),
        helpful_feedback_pct=round(helpful_pct, 2),
        not_helpful_feedback_pct=round(not_help_pct, 2),
        positive_pct=round(positive_pct, 2),
        negative_pct=round(negative_pct, 2),
        knowledge_coverage=knowledge_coverage,
    )

    # ── Categories ──────────────────────────────────────────────────
    cat_rows = (
        user_msgs.with_entities(models.ChatMessage.category, func.count().label("cnt"))
        .group_by(models.ChatMessage.category).all()
    )
    cat_total = sum(r.cnt for r in cat_rows) or 1
    category_breakdown = [
        CategoryBreakdown(
            category=r.category or "General",
            count=r.cnt,
            percentage=round(r.cnt / cat_total * 100, 2)
        ) for r in cat_rows
    ]

    # ── Time series ─────────────────────────────────────────────────
    daily_stats   = _time_series(db, company_id, days=30)
    weekly_stats  = _weekly_series(db, company_id, weeks=12)
    monthly_stats = _monthly_series(db, company_id, months=12)
    hourly_stats  = _hourly_series(db, company_id)

    # ── Top questions ───────────────────────────────────────────────
    top_q = (
        user_msgs
        .with_entities(models.ChatMessage.content, func.count().label("cnt"))
        .group_by(models.ChatMessage.content)
        .order_by(desc("cnt")).limit(10).all()
    )
    top_questions = [TopQuestion(question=r.content[:120], count=r.cnt) for r in top_q]

    # ── Failed / unanswered queries ──────────────────────────────────
    failed_msgs = (
        msg_q()
        .filter(
            models.ChatMessage.role == "assistant",
            models.ChatMessage.content.ilike("%don't have information%")
        )
        .order_by(models.ChatMessage.created_at.desc())
        .limit(10).all()
    )
    top_failed = [FailedQuery(query=m.content[:120], count=1) for m in failed_msgs]

    return AnalyticsResponse(
        summary=summary,
        category_breakdown=category_breakdown,
        sentiment_breakdown=sentiment_breakdown,
        daily_stats=daily_stats,
        weekly_stats=weekly_stats,
        monthly_stats=monthly_stats,
        hourly_stats=hourly_stats,
        top_questions=top_questions,
        top_failed_queries=top_failed,
        feedback_rating=round(helpful_pct / 100.0, 2),
    )


# ── Time series helpers ──────────────────────────────────────────────────────

def _time_series(db: Session, company_id: int, days: int) -> list:
    result = []
    for i in range(days - 1, -1, -1):
        day = (datetime.utcnow() - timedelta(days=i)).date()
        count = (
            db.query(models.ChatMessage)
            .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
            .filter(
                models.ChatSession.company_id == company_id,
                models.ChatMessage.role == "user",
                func.date(models.ChatMessage.created_at) == str(day)
            ).count()
        )
        result.append(DailyStats(date=str(day), chat_count=count))
    return result


def _weekly_series(db: Session, company_id: int, weeks: int) -> list:
    result = []
    for i in range(weeks - 1, -1, -1):
        week_start = (datetime.utcnow() - timedelta(weeks=i)).date()
        week_end   = week_start + timedelta(days=7)
        count = (
            db.query(models.ChatMessage)
            .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
            .filter(
                models.ChatSession.company_id == company_id,
                models.ChatMessage.role == "user",
                func.date(models.ChatMessage.created_at) >= str(week_start),
                func.date(models.ChatMessage.created_at) <  str(week_end),
            ).count()
        )
        result.append(DailyStats(date=str(week_start), chat_count=count))
    return result


def _monthly_series(db: Session, company_id: int, months: int) -> list:
    result = []
    for i in range(months - 1, -1, -1):
        d = datetime.utcnow().replace(day=1) - timedelta(days=i * 30)
        label = d.strftime("%Y-%m")
        count = (
            db.query(models.ChatMessage)
            .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
            .filter(
                models.ChatSession.company_id == company_id,
                models.ChatMessage.role == "user",
                func.strftime("%Y-%m", models.ChatMessage.created_at) == label,
            ).count()
        )
        result.append(DailyStats(date=label, chat_count=count))
    return result


def _hourly_series(db: Session, company_id: int) -> list:
    """Returns chat counts per hour for the last 24 hours."""
    result = []
    now = datetime.utcnow()
    for i in range(23, -1, -1):
        hour_start = (now - timedelta(hours=i)).replace(minute=0, second=0, microsecond=0)
        hour_end   = hour_start + timedelta(hours=1)
        count = (
            db.query(models.ChatMessage)
            .join(models.ChatSession, models.ChatMessage.session_id == models.ChatSession.session_id)
            .filter(
                models.ChatSession.company_id == company_id,
                models.ChatMessage.role == "user",
                models.ChatMessage.created_at >= hour_start,
                models.ChatMessage.created_at <  hour_end,
            ).count()
        )
        result.append(DailyStats(date=hour_start.strftime("%H:00"), chat_count=count))
    return result
