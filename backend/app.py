from fastapi import FastAPI
from pydantic import BaseModel

from services.rag_service import get_relevant_context
from services.LLM_service import generate_response

from database.database import engine, SessionLocal
from database.models import Base, ChatHistory
from services.history_service import get_recent_history

from services.analytics_service import (
    classify_issue,
    detect_sentiment
)


app = FastAPI()


Base.metadata.create_all(bind=engine)



class ChatRequest(BaseModel):

    query: str



@app.get("/")
def home():

    return {
        "application": "Resolve AI",
        "status": "running",
        "version": "1.0.0",
        "documentation": "/docs"
    }



@app.post("/chat")
def chat(request: ChatRequest):


    context = get_relevant_context(
        request.query
    )


    history = get_recent_history()

    answer = generate_response(

      request.query,

      context,

      history

    )


    category = classify_issue(
        request.query
    )


    sentiment = detect_sentiment(
        request.query
    )


    db = SessionLocal()


    chat_record = ChatHistory(

        question=request.query,

        answer=answer,

        category=category,

        sentiment=sentiment

    )


    db.add(chat_record)


    db.commit()


    db.close()


    return {

        "question": request.query,

        "answer": answer,

        "category": category,

        "sentiment": sentiment

    }



@app.get("/analytics")
def analytics():


    db = SessionLocal()


    chats = db.query(
        ChatHistory
    ).all()


    total = len(chats)


    categories = {}


    for chat in chats:


        if chat.category in categories:

            categories[chat.category] += 1


        else:

            categories[chat.category] = 1


    db.close()


    return {

        "total_chats": total,

        "categories": categories

    }

@app.get("/history")
def get_chat_history():


    db = SessionLocal()


    chats = db.query(
        ChatHistory
    ).all()


    history = []


    for chat in chats:


        history.append(

            {

                "id": chat.id,

                "question": chat.question,

                "answer": chat.answer,

                "category": chat.category,

                "sentiment": chat.sentiment,

                "created_at": chat.created_at

            }

        )


    db.close()


    return {

        "total_records": len(history),

        "history": history

    }

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "Resolve AI",
        "version": "1.0.0"
    }