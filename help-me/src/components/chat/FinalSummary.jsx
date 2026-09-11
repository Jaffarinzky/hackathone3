import { CheckCircle2, Clock3, Home, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'
import SolutionBlock from './SolutionBlock'
import TicketCard from './TicketCard'

/**
 * Финальный блок завершённого обращения:
 * заголовок статуса + пошаговое решение + карточка тикета + действия.
 */
export default function FinalSummary({ message, ticket, onResolve, isResolving }) {
  const fallback = message?.ticket ?? {}
  const data = ticket ?? fallback
  const ticketId = data.ticketId ?? data.ticket_id ?? data.id ?? null
  const status = data.status ?? 'open'
  const isEscalated = status === 'needs_specialist'
  const isOpen = status === 'open'
  const hasFinalSolution = Boolean(message?.isFinal && message?.solution)
  const showResolve = hasFinalSolution && isOpen && typeof onResolve === 'function'

  const StatusIcon = isEscalated ? Clock3 : CheckCircle2
  const title = isEscalated
    ? 'Обращение передано специалисту'
    : isOpen && hasFinalSolution
      ? 'Решение готово'
      : 'Обращение завершено'
  const subtitle = isEscalated
    ? 'Ожидайте ответа специалиста.'
    : isOpen && hasFinalSolution
      ? 'Ассистент предложил решение. Если оно помогло — закройте обращение кнопкой ниже.'
      : 'Ассистент провёл диагностику, нашёл решение и закрыл обращение.'

  const cardTicket = {
    ticketId,
    category: data.category ?? null,
    status,
    confidenceScore: data.confidenceScore ?? data.confidence_score ?? null,
    rating: data.rating ?? null,
  }

  return (
    <div className="space-y-4">
      {/* Заголовок статуса */}
      <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset ring-brand-100 ${
          isEscalated ? 'bg-amber-50 text-amber-700' : 'bg-brand-50 text-brand-600'
        }`}>
          <StatusIcon className="size-5.5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Решение (step-by-step от backend) */}
      {message?.solution && <SolutionBlock text={message.solution} />}

      {/* Кнопка закрытия тикета: is_final + status open */}
      {showResolve && (
        <button
          type="button"
          onClick={onResolve}
          disabled={isResolving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResolving ? (
            <>
              <Clock3 className="size-4 animate-spin" aria-hidden="true" />
              Закрываем обращение…
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Проблема решена
            </>
          )}
        </button>
      )}

      {/* Карточка тикета + CSAT (CSAT — только при closed) */}
      <TicketCard ticket={cardTicket} />

      {/* Действия */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Home className="size-4" aria-hidden="true" />
          На главную
        </Link>
        <Link
          to="/tickets"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          <Ticket className="size-4" aria-hidden="true" />
          Мои заявки
        </Link>
      </div>
    </div>
  )
}