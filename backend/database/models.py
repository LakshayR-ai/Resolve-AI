from sqlalchemy import Column, Integer, String, DateTime

from datetime import datetime

from database.database import Base



class ChatHistory(Base):


    __tablename__ = "chat_history"


    id = Column(
        Integer,
        primary_key=True
    )


    question = Column(
        String
    )


    answer = Column(
        String
    )


    category = Column(
        String
    )


    sentiment = Column(
        String
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )