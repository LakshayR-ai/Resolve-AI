from sqlalchemy import Column, Integer, String

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