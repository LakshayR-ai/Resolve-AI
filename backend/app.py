from fastapi import FastAPI
from pydantic import BaseModel

from services.rag_service import get_relevant_context
from services.LLM_service import generate_response

from database.database import engine, SessionLocal

from database.models import Base, ChatHistory

app = FastAPI()

Base.metadata.create_all(bind=engine)


class ChatRequest(BaseModel):

    query: str



@app.get("/")
def home():

    return {
        "status":"running"
    }



@app.post("/chat")
def chat(request:ChatRequest):


    context = get_relevant_context(
        request.query
    )


    answer = generate_response(
        request.query,
        context
    )


    db = SessionLocal()


    chat_record = ChatHistory(

        question=request.query,

        answer=answer

    )


    db.add(chat_record)


    db.commit()


    db.close()


    return {

        "question":request.query,

        "answer":answer

    }