import os

from dotenv import load_dotenv

from google import genai



load_dotenv()



client = genai.Client(

    api_key=os.getenv("GEMINI_API_KEY")

)




def generate_response(question, context, history):


    prompt = f"""

You are an AI customer support assistant.

Answer using only the company information given below.


Company Information:

{context}



Customer Question:

{question}



Give a short professional answer.

"""


    response = client.models.generate_content(

        model="gemini-2.5-flash",

        contents=prompt

    )


    return response.text