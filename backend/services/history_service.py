from database.database import SessionLocal
from database.models import ChatHistory


def get_recent_history(limit=5):

    db = SessionLocal()

    chats = (
        db.query(ChatHistory)
        .order_by(ChatHistory.id.desc())
        .limit(limit)
        .all()
    )

    db.close()

    chats.reverse()

    history = ""

    for chat in chats:

        history += (
            f"User: {chat.question}\n"
            f"Assistant: {chat.answer}\n\n"
        )

    print("===== Conversation History =====")
    print(history)
    print("===============================")

    return history