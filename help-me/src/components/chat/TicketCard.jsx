import { useState } from 'react'
import { CheckCircle2, Clock3, Star, User } from 'lucide-react'
import { rateTicket } from '../../api/ticketsApi'
import ConfidenceIndicator from './ConfidenceIndicator'

/**
 * Тикет и его текущий статус (контракт v2, реальный backend).
 *
 * Данные только от backend: ticket_id / category / status / confidence_score.
 * CSAT доступен строго после status === 'closed' (1–5 звёзд, { rate }).
 */

const STATUS_META = {
  open: { icon: Clock3, label: 'В работе' },
  needs_specialist: { icon: User, label: 'Ожидает специалиста' },
  closed: { icon: CheckCircle2, label: 'Закрыто' },
}

export default function TicketCard({ ticket, metaTickets = [] }) {
  const metaTicket = Array.isArray(metaTickets)
    ? metaTickets.find((item) => String(item.ticket_id ?? item.id ?? '') === String(ticket?.ticketId ?? ''))
    : null
  const status = ticket?.status ?? metaTicket?.status ?? 'open'
  const category = ticket?.category ?? metaTicket?.category ?? null
  const meta = STATUS_META[status] ?? STATUS_META.open
  const StatusIcon = meta.icon
  const isClosed = status === 'closed'
  const [rating, setRating] = useState(ticket?.rating ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [hovered, setHovered] = useState(0)
  const [error, setError] = useState(false)

  const submit = async (value) => {
    if (rating !== null || submitting || !isClosed) return
    setSubmitting(true)
    setError(false)
    try {
      await rateTicket(ticket.ticketId, value)
      setRating(value)
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3">
        <StatusIcon className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
          Заявка {ticket?.ticketId ?? '—'}
        </p>
        <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-100">
          {meta.label}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 px-4 py-3">
        <div className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wide text-slate-400">Номер заявки</dt>
          <dd className="mt-0.5 truncate text-sm font-medium text-slate-800">{ticket?.ticketId ?? '—'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wide text-slate-400">Категория</dt>
          <dd className="mt-0.5 truncate text-sm font-medium text-slate-800">{category ?? '—'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wide text-slate-400">Статус</dt>
          <dd className="mt-0.5 truncate text-sm font-medium text-slate-800">{meta.label}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wide text-slate-400">Уверенность системы</dt>
          <dd className="mt-0.5"><ConfidenceIndicator score={ticket?.confidenceScore ?? null} /></dd>
        </div>
      </dl>
      {isClosed && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3.5">
          <p className="text-sm font-medium text-slate-700">Оцените работу ассистента</p>
          <div className="mt-2 flex items-center gap-1.5" role="radiogroup" aria-label="Оценка от 1 до 5">
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} type="button" role="radio" aria-checked={rating === v} aria-label={`${v} из 5`}
                disabled={rating !== null || submitting} onClick={() => submit(v)}
                onMouseEnter={() => setHovered(v)} onMouseLeave={() => setHovered(0)} onFocus={() => setHovered(v)} onBlur={() => setHovered(0)}
                className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:hover:scale-100">
                <Star className={`size-6 ${v <= (hovered || rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} aria-hidden="true" />
              </button>
            ))}
            {submitting && <span className="ml-1 text-xs text-slate-400">Отправляем…</span>}
          </div>
          {error && <p className="mt-1.5 text-xs text-rose-600">Не удалось отправить оценку. Попробуйте ещё раз.</p>}
          {rating !== null && (
            <div className="mt-1.5 flex items-center gap-2" aria-live="polite">
              <CheckCircle2 className="size-4 text-brand-600" aria-hidden="true" />
              <span className="text-sm font-medium text-slate-700">Спасибо за оценку!</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
