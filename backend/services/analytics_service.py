def classify_issue(question):


    question = question.lower()


    if "refund" in question or "payment" in question:

        return "Billing"


    elif "delivery" in question or "shipping" in question:

        return "Shipping"


    elif "login" in question or "error" in question:

        return "Technical"


    else:

        return "General"





def detect_sentiment(question):


    negative_words = [

        "bad",

        "angry",

        "problem",

        "issue",

        "failed"

    ]


    for word in negative_words:


        if word in question.lower():

            return "Negative"


    return "Neutral"