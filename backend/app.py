from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()


class ChatRequest(BaseModel):
    query: str


@app.get("/")
def home():

    return {
        "status": "running"
    }


@app.post("/chat")
def chat(request: ChatRequest):

    response = generate_response(query)

    return {

        "question": request.query,

        "answer": response
    }