import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, Bot, CircleAlert } from 'lucide-react'
import MessageBubble from '../components/chat/MessageBubble'
import TypingIndicator from '../components/chat/TypingIndicator'
import ChatComposer from '../components/chat/ChatComposer'
import FinalSummary from '../components/chat/FinalSummary'
import { createTicket, getSessionTickets, initializeSession } from '../api/sessionsApi'
import {
  getTicketMessages,
  resolveTicket,
  sendTicketMessage,
} from '../api/ticketsApi'

const GREETING_TEXT =
  'Здравствуйте! Я CryptoAssist — виртуальный ассистент службы поддержки. ' +
  'Опишите проблему, и я постараюсь помочь.'

let messageSeq = 0

function formatTime(isoString) {
  const date = isoString ? new Date(isoString) : new Date()
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function makeMessage(role, content, extra = {}) {
  messageSeq += 1
  return {
    id: `ui-msg-${Date.now()}-${messageSeq}`,
    role,
    content,
    time: formatTime(),
    ...extra,
  }
}

/**
 * Адаптация ответа бота (контракт v2) в сообщение UI.
 * Поддерживает поля: ticket_id, message_id, sender, text, category,
 * tags, confidence_score, is_final, status.
 */
function toDisplayMessage(apiMessage) {
  return makeMessage(apiMessage.sender === 'user' ? 'user' : 'bot', apiMessage.text, {
    isFinal: Boolean(apiMessage.is_final),
    solution: apiMessage.is_final ? apiMessage.text : null,
    category: apiMessage.category ?? null,
    tags: Array.isArray(apiMessage.tags) ? apiMessage.tags : [],
    confidenceScore: apiMessage.confidence_score ?? 0,
    time: formatTime(apiMessage.created_at),
  })
}

/** Адаптация сообщения из истории тикета (GET /tickets/{id}/messages). */
function fromHistoryMessage(historyMessage) {
  const isFinal = Boolean(historyMessage.is_final)
  return makeMessage(
    historyMessage.sender === 'user' ? 'user' : 'bot',
    historyMessage.text,
    {
      time: formatTime(historyMessage.created_at),
      tags: [],
      isFinal,
      solution: isFinal ? historyMessage.text : null,
      confidenceScore: historyMessage.confidence_score ?? null,
    },
  )
}

export default function ChatPage() {
  const { ticketId: routeTicketId } = useParams()
  const location = useLocation()
  const isNewChat = !routeTicketId || routeTicketId === 'new'

  const [messages, setMessages] = useState([])
  const [ticket, setTicket] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isResolving, setIsResolving] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [apiError, setApiError] = useState(null)
  const endRef = useRef(null)
  const promptProcessedRef = useRef(false)

  // Читаем initialPrompt напрямую из location.state — доступен сразу при навигации
  const initialPrompt = isNewChat ? (location.state?.initialPrompt ?? null) : null

  const lastMessage = messages.at(-1)
  const finalMessage = lastMessage?.isFinal ? lastMessage : null
  const status = ticket?.status ?? null
  const isSpecialist = status === 'needs_specialist'
  const isClosed = status === 'closed'
  // Summary показывается и для завершённых тикетов без финального сообщения
  // в истории (история с backend не содержит is_final у сообщений).
  const showSummary = !isLoading && (finalMessage !== null || isClosed || isSpecialist)

// Загрузка чата: существующий тикет → история сообщений,
// новый чат → сессия + создание тикета первым сообщением пользователя.
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (isNewChat) {
        const { session_id: newSessionId } = await initializeSession()
        if (cancelled) return

        if (!newSessionId) {
          throw new Error('Не удалось получить идентификатор сессии. Попробуйте обновить страницу.')
        }

        setSessionId(newSessionId)
        setMessages([makeMessage('bot', GREETING_TEXT)])

        if (initialPrompt && !promptProcessedRef.current) {
          promptProcessedRef.current = true
          setIsInitializing(true)
          setMessages((prev) => [...prev, makeMessage('user', initialPrompt)])
          setIsTyping(true)
          try {
            const response = await createTicket(newSessionId, initialPrompt)
            if (cancelled) return
            setTicket({
              ticketId: response.ticket_id,
              status: response.status ?? 'open',
              category: response.category ?? null,
              confidenceScore: response.confidence_score ?? null,
            })
            setMessages((prev) => [...prev, toDisplayMessage(response)])
            window.history.replaceState(null, '', `/chat/${response.ticket_id}`)
          } catch (error) {
            if (!cancelled) setApiError(error)
          } finally {
            if (!cancelled) {
              setIsTyping(false)
              setIsInitializing(false)
            }
          }
        }
        return
      }

      // Существующий тикет: только читаем переписку, ничего не создаём
      const { session_id: newSessionId } = await initializeSession()
      if (cancelled) return

      if (!newSessionId) {
        throw new Error('Не удалось получить идентификатор сессии. Попробуйте обновить страницу.')
      }

      setSessionId(newSessionId)

      const allTickets = await getSessionTickets(newSessionId)
      if (cancelled) return
      const meta = allTickets.find(
        (t) => String(t.ticket_id ?? t.id) === String(routeTicketId),
      )

      const history = await getTicketMessages(routeTicketId)
      if (cancelled) return

      // Уверенность системы backend не хранит в списке тикетов и не приходит
      // в истории сообщений. Извлекаем её из последнего ответа бота, если
      // она там есть (на будущее); иначе — null ("нет данных"), не 0.
      const lastBotMessage = [...history].reverse().find(
        (m) => m.sender === 'bot' && m.confidence_score != null,
      )
      const confidenceScore = lastBotMessage?.confidence_score ?? null

      if (meta) {
        setTicket({
          ticketId: String(meta.ticket_id ?? meta.id),
          status: meta.status,
          category: meta.category ?? null,
          confidenceScore,
          rating: meta.rate ?? meta.rating ?? null,
        })
      }

      setMessages(
        [makeMessage('bot', GREETING_TEXT), ...history.map(fromHistoryMessage)],
      )
    }

    run().catch((error) => {
      if (!cancelled) setApiError(error)
    }).finally(() => {
      if (!cancelled) {
        setIsLoading(false)
        setIsTyping(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [isNewChat, initialPrompt, routeTicketId])

  // Авто-скролл вниз при новых сообщениях, typing-индикаторе и финальном блоке
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping, showSummary])

  const refreshTicketStatus = async (ticketId) => {
    try {
      const all = await getSessionTickets(sessionId)
      const meta = all.find((t) => String(t.ticket_id ?? t.id) === String(ticketId))
      if (meta) {
        setTicket((prev) => ({
          ticketId: String(meta.ticket_id ?? meta.id),
          status: meta.status,
          category: meta.category ?? prev?.category ?? null,
          confidenceScore: prev?.confidenceScore ?? null,
        }))
      }
    } catch {
      // статус обновится следующим ответом бота — молча пропускаем
    }
  }

  const handleSend = async (text) => {
    if (isClosed || isSpecialist || isTyping || isLoading || isInitializing) return
    const clean = text.trim().slice(0, 500)
    if (!clean) return
    setApiError(null)

    // Новый диалог без тикета: первое сообщение создаёт тикет
    if (!ticket) {
      setMessages((prev) => [...prev, makeMessage('user', clean)])
      setIsTyping(true)
      setIsInitializing(true)
      try {
        const sid = sessionId ?? (await initializeSession()).session_id
        setSessionId(sid)
        const response = await createTicket(sid, clean)
        const ticketId = String(response.ticket_id)
        setTicket({
          ticketId,
          status: response.status ?? 'open',
          category: response.category ?? null,
          confidenceScore: response.confidence_score ?? null,
        })
        setMessages((prev) => [...prev, toDisplayMessage(response)])
        window.history.replaceState(null, '', `/chat/${ticketId}`)
      } catch (error) {
        setApiError(error)
      } finally {
        setIsTyping(false)
        setIsInitializing(false)
      }
      return
    }

    setMessages((prev) => [...prev, makeMessage('user', clean)])
    setIsTyping(true)
    try {
      const response = await sendTicketMessage(ticket.ticketId, clean)
      setTicket((prev) => ({
        ...prev,
        status: response.status ?? prev.status,
        category: response.category ?? prev.category,
        confidenceScore: response.confidence_score ?? prev.confidenceScore,
      }))
      setMessages((prev) => [...prev, toDisplayMessage(response)])
    } catch (error) {
      setApiError(error)
      if (error?.status === 400) await refreshTicketStatus(ticket.ticketId)
    } finally {
      setIsTyping(false)
    }
  }

  const handleResolve = async () => {
    if (!ticket || isResolving || isClosed) return
    setIsResolving(true)
    setApiError(null)
    try {
      await resolveTicket(ticket.ticketId)
      await refreshTicketStatus(ticket.ticketId)
      setTicket((prev) => ({ ...prev, status: 'closed' }))
    } catch (error) {
      setApiError(error)
    } finally {
      setIsResolving(false)
    }
  }

  // Первый ответ бота в новом чате не прижат к шапке (отступ сверху)
  const inputLocked = isClosed || isSpecialist || isInitializing
  const composerPlaceholder = isClosed
    ? 'Обращение закрыто — новые сообщения недоступны'
    : isSpecialist
      ? 'Обращение ожидает специалиста'
      : isInitializing
        ? 'Ассистент отвечает…'
        : undefined

  return (
    <section className="flex flex-1 flex-col bg-[#fbfdfc]">
      {/* Шапка чата */}
      <div className="flex-shrink-0 border-b border-slate-200/70 bg-white px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
        <Link
          to="/"
          aria-label="На главную"
          className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <ArrowLeft className="size-4.5" aria-hidden="true" />
        </Link>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100" aria-hidden="true">
          <Bot className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-slate-900">
            Диалог с ассистентом
          </h1>
          <p className="truncate text-xs text-slate-400">
            {ticket ? `Заявка · #${ticket.ticketId}` : 'Новый диалог'}
          </p>
        </div>
      </div>
      </div>

      {/* Лента сообщений + финальный блок */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto scroll-soft bg-[#fbfdfc] px-4 py-4 pb-6 sm:px-6" style={{ minHeight: 0 }}>
        {isLoading ? (
          <div className="flex flex-col gap-4 pt-4" aria-busy="true" aria-label="Загрузка диалога">
            <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            <div className="ml-auto h-12 w-2/3 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            {apiError && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3" role="alert">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-rose-500" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-rose-700">{apiError.message}</p>
                  <button
                    type="button"
                    onClick={() => setApiError(null)}
                    className="mt-1 text-xs font-medium text-rose-600 underline-offset-2 hover:underline"
                  >
                    Скрыть
                  </button>
                </div>
              </div>
            )}
            {showSummary && (
              <FinalSummary
                message={finalMessage}
                ticket={ticket}
                onResolve={handleResolve}
                isResolving={isResolving}
              />
            )}
            <div ref={endRef} aria-hidden="true" />
          </>
        )}
      </div>

      {/* Нижний фиксированный ввод */}
      <div className="flex-shrink-0 border-t border-slate-200/70 bg-white px-4 pt-3 pb-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          {isSpecialist && !isLoading && (
            <p className="mb-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-center text-sm font-medium text-amber-700 ring-1 ring-inset ring-amber-200/70">
              Обращение передано специалисту. Ожидайте ответа специалиста.
            </p>
          )}
          <ChatComposer
            onSend={handleSend}
            disabled={inputLocked || isTyping || isLoading || isInitializing}
            busy={isTyping}
            disabledPlaceholder={composerPlaceholder}
          />
        </div>
      </div>
      {/* ANCHOR_BODY */}
    </section>
  )
}