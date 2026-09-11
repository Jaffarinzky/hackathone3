import apiClient, { ApiError, normalizeList } from './apiClient'

/**
 * Сессии и тикеты (контракт v2, реальный backend).
 *
 * Модель: session → tickets → messages.
 * session_id хранится в localStorage и используется в URL запросов,
 * НЕ передаётся в headers.
 */

const SESSION_STORAGE_KEY = 'session_id'

/** Возвращает сохранённый session_id или null. */
export function getSessionId() {
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY)
  } catch {
    return null
  }
}

function saveSessionId(sessionId) {
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId)
  } catch {
    // localStorage может быть недоступен — работаем в рамках сессии страницы
  }
}

/**
 * POST /sessions → { session_id }
 * Повторно не вызывается, если session_id уже сохранён.
 */
export async function createSession() {
  const { data } = await apiClient.post('/sessions', {})
  const sessionId = data?.session_id ?? data?.sessionId ?? data?.id ?? data
  if (!sessionId || typeof sessionId !== 'string') {
    throw new ApiError('Сервер не вернул корректный session_id', null)
  }
  saveSessionId(sessionId)
  return { session_id: sessionId }
}

/**
 * Гарантирует наличие session_id: берёт из localStorage
 * или создаёт новую сессию одним POST /sessions.
 */
export async function initializeSession() {
  const existing = getSessionId()
  if (existing) return { session_id: existing }
  return createSession()
}

/**
 * GET /sessions/{session_id}/tickets
 * Список тикетов текущего пользователя.
 *
 * Backend возвращает тикеты с полем `id` (а не `ticket_id`).
 * Нормализуем так, чтобы внутри приложения всегда был `ticket_id`.
 */
export async function getSessionTickets(sessionId) {
  const { data } = await apiClient.get(
    `/sessions/${encodeURIComponent(sessionId)}/tickets`,
  )
  return normalizeList(data, 'tickets').map((ticket) => {
    if (!ticket || typeof ticket !== 'object') return ticket
    return { ...ticket, ticket_id: ticket.ticket_id ?? ticket.id }
  })
}

/**
 * POST /sessions/{session_id}/tickets
 * Создаёт тикет, сохраняет первое сообщение и возвращает ответ бота.
 */
export async function createTicket(sessionId, text) {
  const { data } = await apiClient.post(
    `/sessions/${encodeURIComponent(sessionId)}/tickets`,
    { text },
  )
  return data
}