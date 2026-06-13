from fastapi import FastAPI


app = FastAPI(
    title="Resolve-AI"
)


@app.get("/")
def home():

    return {
        "message":"Resolve-AI Backend Running"
    }