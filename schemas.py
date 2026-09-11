from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SessionCreateResponse(BaseModel):
    session_id: str

class TicketCreateRequest(BaseModel):
    text: str = Field(..., max_length=500)

class MessageCreateRequest(BaseModel):
    text: str = Field(..., max_length=500)

class TicketBotResponse(BaseModel):
    ticket_id: str
    message_id: str
    sender: str
    text: str
    category: str
    tags: List[str]
    confidence_score: int
    is_final: bool
    status: str

class MessageHistoryItem(BaseModel):
    message_id: str
    sender: str
    text: str
    created_at: datetime

class MessageHistoryResponse(BaseModel):
    ticket_id: str
    messages: List[MessageHistoryItem]

class TicketRatingRequest(BaseModel):
    # Изменено: обязательная оценка от 1 до 5
    rate: int = Field(..., ge=1, le=5, description="Оценка работы поддержки (1-5)")

class TicketRatingResponse(BaseModel):
    status: str
    ticket_id: str
    rate: int

class TicketItem(BaseModel):
    id: str
    session_id: str
    category: str
    tags: List[str]
    status: str
    rate: Optional[int] = None
    created_at: datetime

class TicketListResponse(BaseModel):
    tickets: List[TicketItem]

class SessionTicketsResponse(BaseModel):
    session_id: str
    tickets: List[TicketItem]