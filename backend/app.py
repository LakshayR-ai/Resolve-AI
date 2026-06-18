from fastapi import FastAPI
from pydantic import BaseModel

from services.rag_service import get_relevant_context
from services.LLM_service import generate_response


app = FastAPI()


class ChatRequest(BaseModel):

    query: str



@app.get("/")
def home():

    return {
        "status":"running"
    }



@app.post("/chat")
def chat(request: ChatRequest):


    context = get_relevant_context(
        request.query
    )


    answer = generate_response(
        request.query,
        context
    )


    return {

        "question": request.query,

        "answer": answer

    }