import json
import os
import random
from typing import Optional, List
import httpx
import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from openai import OpenAI

import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ПолитехАссист API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://crypto-assist.ddns.net",
        "http://crypto-assist.ddns.net",
        "http://127.0.0.1:5173",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

custom_http_client = httpx.Client(
    http2=False,  # Отключает зависания HTTP/2 соединения на Cloudflare
    timeout=httpx.Timeout(
        connect=10.0,   # 10 сек на подключение
        read=90.0,      # 90 сек на ожидание ответа от DeepSeek
        write=10.0,
        pool=10.0
    )
)

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
    http_client=custom_http_client,
    default_headers={
        "HTTP-Referer": "https://polytech.local",  # Заголовок для OpenRouter (необязательно, но рекомендуется)
        "X-Title": "Polytech Assistant",
    }
)

# Модель по умолчанию для OpenRouter (например, бесплатная DeepSeek или Llama)
MODEL_NAME = os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-r1:free")

with open("knowledge.json", "r", encoding="utf-8") as f:
    KNOWLEDGE_BASE = json.load(f)

TICKET_STATUS_OPEN = "open"
TICKET_STATUS_CLOSED = "closed"
TICKET_STATUS_NEEDS_SPECIALIST = "needs_specialist"


def generate_ticket_id() -> str:
    return f"INC-{random.randint(1000, 9999)}"


def build_system_prompt() -> str:
    return f"""
Ты — интеллектуальный маршрутизатор и ассистент первой линии
технической поддержки криптовалютной биржи «CryptoAssist».
Твоя единственная задача — проанализировать запрос пользователя, найти
релевантную запись в предоставленной Базе Знаний (Knowledge Base) и
вернуть ответ СТРОГО в формате JSON.

Каждая запись Базы Знаний содержит поля: category, tags (ключевые
слова), issue (описание проблемы), solution (алгоритм решения,
может быть пустым) и force_escalate (true/false).

ПРАВИЛА РАБОТЫ (КРИТИЧЕСКИ ВАЖНО):
1. НУЛЕВАЯ ТОЛЕРАНТНОСТЬ К ГАЛЛЮЦИНАЦИЯМ: бери инструкции ТОЛЬКО из
поля solution найденной записи. Запрещено выдумывать шаги решения,
суммы, сроки зачисления, размеры комиссий или лимиты, которых нет
в Базе.
2. НЕТ ДОСТУПА К ДАННЫМ АККАУНТА: ты не имеешь доступа к балансу,
истории транзакций или статусу KYC конкретного пользователя. Никогда
не утверждай, что «проверил» его счёт или транзакцию — давай только
общий алгоритм диагностики и, если нужно, проси уточняющие данные
(например, хэш транзакции, сеть перевода).
3. НЕТ ФИНАНСОВЫХ СОВЕТОВ: если вопрос касается инвестиционных
решений (покупать/продавать, куда вложить, прогноз курса), вежливо
откажись их давать, объясни, что не предоставляешь инвестиционные
рекомендации, установи category: "Другое", is_final: true.
4. КАТЕГОРИИ: выбирай значение поля "category" СТРОГО из списка:
[KYC, Ввод средств, Вывод средств, Торговля/Ордера, Безопасность,
Комиссии, Другое].
5. FORCE_ESCALATE И ПРИЗНАКИ КОМПРОМЕТАЦИИ АККАУНТА: если у найденной
записи "force_escalate": true, ИЛИ пользователь сообщает о взломе,
краже средств, входе с незнакомого устройства или несанкционированных
операциях — НЕ предлагай решение из поля solution, даже если оно
непустое. Установи category: "Безопасность", confidence_score не
выше 30, is_final: true, а в text напиши, что обращение немедленно
передано специалисту по безопасности.
6. ЛОГИКА УВЕРЕННОСТИ И МАРШРУТИЗАЦИИ (confidence_score от 0 до 100):
- Уверенность 85-100 (точное совпадение): в Базе Знаний есть явное
решение (непустой solution, force_escalate: false). Действие:
скопируй решение из solution в поле "text", установи "is_final": true.
- Уверенность 31-84 (неоднозначность): проблема понятна частично,
требуется уточнение. Действие: сформируй ОДИН короткий уточняющий
вопрос в поле "text", установи "is_final": false.
- Уверенность 0-30 (нет данных или чувствительный случай): в Базе
Знаний нет подходящей записи, либо речь идёт о спорной финансовой
операции (отмена ордера, возврат средств, разблокировка аккаунта).
Действие: в поле "text" напиши "К сожалению, я не могу решить этот
вопрос автоматически. Перевожу на специалиста.", установи
"is_final": true.

ФОРМАТ ОТВЕТА (только JSON объект):
{{
  "category": "Ввод средств",
  "confidence_score": 95,
  "text": "1. Проверьте статус транзакции в обозревателе сети.\n2. Убедитесь в достаточном числе подтверждений.",
  "is_final": true
}}

БАЗА ЗНАНИЙ (JSON):
{json.dumps(KNOWLEDGE_BASE, ensure_ascii=False)}
"""


def query_ai(history_messages: List[models.MessageModel]) -> dict:
    openai_messages = [{"role": "system", "content": build_system_prompt()}]
    for msg in history_messages:
        role = "user" if msg.sender == "user" else "assistant"
        openai_messages.append({"role": role, "content": msg.text})

    ai_data = None
    try:
        print("=== AI REQUEST START (OpenRouter) ===", flush=True)
        
        # Отправляем запрос без принудительного response_format, чтобы избежать 400/500 ошибок у некоторых провайдеров OpenRouter
        response = client.chat.completions.create(
            model=MODEL_NAME,
            temperature=0.0,
            messages=openai_messages
        )
        print("=== AI RESPONSE RECEIVED ===", flush=True)

        raw_content = response.choices[0].message.content

        # Очистка от возможных markdown-тегов ```json ... ```
        if "```" in raw_content:
            raw_content = raw_content.replace("```json", "").replace("```", "").strip()

        ai_data = json.loads(raw_content)
        print("=== AI JSON PARSED ===", ai_data, flush=True)
    except Exception as e:
        print(f"Ошибка запроса к OpenRouter: {e}", flush=True)

    if not ai_data:
        ai_data = {
            "category": "Другое",
            "tags": [],
            "confidence_score": 0,
            "text": "К сожалению, сервис ассистента временно недоступен. Заявка передана специалисту.",
            "is_final": True
        }

    ai_data.setdefault("tags", [])
    ai_data.setdefault("category", "Другое")
    ai_data.setdefault("confidence_score", 0)
    ai_data.setdefault("is_final", True)
    ai_data.setdefault("text", "")
    return ai_data


def ticket_to_item(t: models.TicketModel) -> dict:
    return {
        "id": t.id,
        "session_id": t.session_id,
        "category": t.category,
        "tags": t.tags or [],
        "status": t.status,
        "rate": t.rate,
        "created_at": t.created_at,
    }


@app.post("/api/v1/sessions", response_model=schemas.SessionCreateResponse, status_code=201)
def create_session(db: Session = Depends(get_db)):
    new_session = models.SessionModel()
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return {"session_id": new_session.id}


@app.get("/api/v1/sessions/{session_id}/tickets", response_model=schemas.SessionTicketsResponse)
def get_session_tickets(session_id: str, db: Session = Depends(get_db)):
    session_obj = db.query(models.SessionModel).filter(models.SessionModel.id == session_id).first()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    tickets = (
        db.query(models.TicketModel)
        .filter(models.TicketModel.session_id == session_id)
        .order_by(models.TicketModel.created_at.desc())
        .all()
    )
    return {"session_id": session_id, "tickets": [ticket_to_item(t) for t in tickets]}


@app.post("/api/v1/sessions/{session_id}/tickets", response_model=schemas.TicketBotResponse, status_code=201)
def create_ticket(session_id: str, req: schemas.TicketCreateRequest, db: Session = Depends(get_db)):
    session_obj = db.query(models.SessionModel).filter(models.SessionModel.id == session_id).first()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    ticket = models.TicketModel(
        id=generate_ticket_id(),
        session_id=session_id,
        status=TICKET_STATUS_OPEN,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    user_msg = models.MessageModel(ticket_id=ticket.id, sender="user", text=req.text)
    db.add(user_msg)
    db.commit()

    ai_data = query_ai([user_msg])

    bot_msg = models.MessageModel(ticket_id=ticket.id, sender="bot", text=ai_data["text"])
    db.add(bot_msg)

    ticket.category = ai_data["category"]
    ticket.tags = ai_data["tags"]
    if ai_data["is_final"] and ai_data["confidence_score"] <= 30:
        ticket.status = TICKET_STATUS_NEEDS_SPECIALIST

    db.commit()
    db.refresh(bot_msg)
    db.refresh(ticket)

    return {
        "ticket_id": ticket.id,
        "message_id": bot_msg.id,
        "sender": "bot",
        "text": ai_data["text"],
        "category": ticket.category,
        "tags": ticket.tags or [],
        "confidence_score": ai_data["confidence_score"],
        "is_final": ai_data["is_final"],
        "status": ticket.status,
    }


@app.post("/api/v1/tickets/{ticket_id}/messages", response_model=schemas.TicketBotResponse)
def send_message(ticket_id: str, req: schemas.MessageCreateRequest, db: Session = Depends(get_db)):
    ticket = db.query(models.TicketModel).filter(models.TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Тикет не найден")

    if ticket.status != TICKET_STATUS_OPEN:
        raise HTTPException(status_code=400, detail="Тикет закрыт или передан специалисту")

    user_msg = models.MessageModel(ticket_id=ticket_id, sender="user", text=req.text)
    db.add(user_msg)
    db.commit()

    history_messages = (
        db.query(models.MessageModel)
        .filter(models.MessageModel.ticket_id == ticket_id)
        .order_by(models.MessageModel.created_at.asc())
        .all()
    )

    ai_data = query_ai(history_messages)

    bot_msg = models.MessageModel(ticket_id=ticket_id, sender="bot", text=ai_data["text"])
    db.add(bot_msg)

    ticket.category = ai_data["category"]
    ticket.tags = list(dict.fromkeys((ticket.tags or []) + ai_data["tags"]))

    if ai_data["is_final"] and ai_data["confidence_score"] <= 30:
        ticket.status = TICKET_STATUS_NEEDS_SPECIALIST

    db.commit()
    db.refresh(bot_msg)
    db.refresh(ticket)

    return {
        "ticket_id": ticket.id,
        "message_id": bot_msg.id,
        "sender": "bot",
        "text": ai_data["text"],
        "category": ticket.category,
        "tags": ticket.tags or [],
        "confidence_score": ai_data["confidence_score"],
        "is_final": ai_data["is_final"],
        "status": ticket.status,
    }


@app.get("/api/v1/tickets/{ticket_id}/messages", response_model=schemas.MessageHistoryResponse)
def get_ticket_messages(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(models.TicketModel).filter(models.TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Тикет не найден")

    messages = (
        db.query(models.MessageModel)
        .filter(models.MessageModel.ticket_id == ticket_id)
        .order_by(models.MessageModel.created_at.asc())
        .all()
    )
    return {
        "ticket_id": ticket_id,
        "messages": [
            {
                "message_id": m.id,
                "sender": m.sender,
                "text": m.text,
                "created_at": m.created_at,
            } for m in messages
        ]
    }


# ---------------------------------------------------------------------------
# Новые эндпоинты для Закрытия и Оценки тикета
# ---------------------------------------------------------------------------

@app.patch("/api/v1/tickets/{ticket_id}/resolve")
def resolve_ticket_by_user(ticket_id: str, db: Session = Depends(get_db)):
    """Кнопка пользователя 'Проблема решена'. Закрывает тикет, открывая доступ к оценке."""
    ticket = db.query(models.TicketModel).filter(models.TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Тикет не найден")

    if ticket.status == TICKET_STATUS_CLOSED:
        raise HTTPException(status_code=400, detail="Тикет уже закрыт")

    ticket.status = TICKET_STATUS_CLOSED
    db.commit()

    return {"status": "success", "message": "Тикет закрыт пользователем", "ticket_id": ticket.id}


@app.patch("/api/v1/tickets/{ticket_id}/close")
def close_ticket_by_specialist(ticket_id: str, db: Session = Depends(get_db)):
    """Специалист закрывает тикет (status = needs_specialist -> closed)."""
    ticket = db.query(models.TicketModel).filter(models.TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Тикет не найден")

    ticket.status = TICKET_STATUS_CLOSED
    db.commit()

    return {"status": "success", "message": "Тикет закрыт специалистом", "ticket_id": ticket.id}


@app.patch("/api/v1/tickets/{ticket_id}/rating", response_model=schemas.TicketRatingResponse)
def rate_ticket(ticket_id: str, req: schemas.TicketRatingRequest, db: Session = Depends(get_db)):
    """Выставление звезд (1-5). Доступно СТРОГО после закрытия тикета."""
    ticket = db.query(models.TicketModel).filter(models.TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Тикет не найден")

    if ticket.status != TICKET_STATUS_CLOSED:
        raise HTTPException(status_code=400, detail="Оценить работу можно только после завершения (закрытия) тикета")

    ticket.rate = req.rate
    db.commit()
    db.refresh(ticket)

    return {"status": "success", "ticket_id": ticket.id, "rate": ticket.rate}


@app.get("/api/v1/tickets", response_model=schemas.TicketListResponse)
def get_tickets(session_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.TicketModel)
    if session_id:
        query = query.filter(models.TicketModel.session_id == session_id)
    tickets = query.order_by(models.TicketModel.created_at.desc()).all()
    return {"tickets": [ticket_to_item(t) for t in tickets]}

