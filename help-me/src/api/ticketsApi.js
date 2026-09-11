import apiClient, { normalizeList } from './apiClient'

/**
 * Заявки (контракт v2, реальный backend). Модель: session → tickets → messages.
 * Статусы тикета: open | needs_specialist | closed.
 */

/**
 * POST /tickets/{ticket_id}/messages
 * Все последующие сообщения тикета (после первого).
 * Backend вернёт 400, если тикет не в статусе open.
 */
export async function sendTicketMessage(ticketId, text) {
  const { data } = await apiClient.post(
    `/tickets/${encodeURIComponent(ticketId)}/messages`,
    { text },
  )
  return data
}

/**
 * GET /tickets/{ticket_id}/messages
 * История переписки тикета. Возвращает массив сообщений.
 */
export async function getTicketMessages(ticketId) {
  const { data } = await apiClient.get(
    `/tickets/${encodeURIComponent(ticketId)}/messages`,
  )
  return normalizeList(data, 'messages')
}

/**
 * PATCH /tickets/{ticket_id}/resolve
 * Пользователь подтверждает, что проблема решена → status = closed.
 * Body не нужен.
 */
export async function resolveTicket(ticketId) {
  const { data } = await apiClient.patch(
    `/tickets/${encodeURIComponent(ticketId)}/resolve`,
  )
  return data
}

/**
 * PATCH /tickets/{ticket_id}/rating
 * CSAT-оценка 1–5: { rate: 1..5 }.
 */
export async function rateTicket(ticketId, rate) {
  const value = Math.max(1, Math.min(5, Math.round(Number(rate) || 0)))
  const { data } = await apiClient.patch(
    `/tickets/${encodeURIComponent(ticketId)}/rating`,
    { rate: value },
  )
  return data
}