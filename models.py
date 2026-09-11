import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from database import Base


class SessionModel(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tickets = relationship("TicketModel", back_populates="session", cascade="all, delete-orphan")


class TicketModel(Base):
    __tablename__ = "tickets"
    id = Column(String, primary_key=True)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    category = Column(String, default="Другое")
    tags = Column(JSON, default=list)
    status = Column(String, default="open")  # open / closed / needs_specialist

    # Изменено: теперь хранит оценку от 1 до 5
    rate = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionModel", back_populates="tickets")
    messages = relationship("MessageModel", back_populates="ticket", cascade="all, delete-orphan")


class MessageModel(Base):
    __tablename__ = "messages"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False)
    sender = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    ticket = relationship("TicketModel", back_populates="messages")