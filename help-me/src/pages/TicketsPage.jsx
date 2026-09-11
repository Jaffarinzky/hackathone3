import { useEffect, useState } from 'react'
import { Clock, Plus, Ticket } from 'lucide-react'
import { getSessionTickets, initializeSession } from '../api/sessionsApi'
import { getCategoryIcon, formatDate, STATUS_META, DEFAULT_STATUS } from '../utils/ui'
import ListPageShell from '../components/common/ListPageShell'

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const fetchData = async () => {
    try {
      const { session_id: sessionId } = await initializeSession()
      const data = await getSessionTickets(sessionId)
      setTickets(data)
    } catch {
      setHasError(true)
    }
  }

  useEffect(() => {
    let cancelled = false
    initializeSession()
      .then(({ session_id: sessionId }) => getSessionTickets(sessionId))
      .then((data) => {
        if (!cancelled) setTickets(data)
      })
      .catch(() => {
        if (!cancelled) setHasError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const retry = () => {
    setHasError(false)
    setLoading(true)
    fetchData().finally(() => setLoading(false))
  }

  return (
    <ListPageShell
      icon={<Ticket className="size-5" aria-hidden="true" />}
      title="Мои заявки"
      subtitle="Какие заявки у меня есть и каков их статус"
      items={tickets}
      loading={loading}
      hasError={hasError}
      onRetry={retry}
      empty={{
        icon: Plus,
        title: 'У вас пока нет заявок',
        description: 'Создайте обращение через ассистента, и заявка появится здесь.',
      }}
    >
      <ul className="card divide-y divide-slate-100 overflow-hidden">
        {tickets.map((ticket) => {
          const Icon = getCategoryIcon(ticket.category)
          const status = STATUS_META[ticket.status] ?? DEFAULT_STATUS
          const StatusIcon = status.icon
          return (
            <li key={ticket.ticket_id} className="flex items-start gap-4 px-5 py-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 tabular-nums">
                  {ticket.ticket_id}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                    <Icon className="size-3" aria-hidden="true" />
                    {ticket.category ?? 'Без категории'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" aria-hidden="true" />
                    {formatDate(ticket.created_at)}
                  </span>
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.badge}`}
              >
                <StatusIcon className="size-3" aria-hidden="true" />
                {status.label}
              </span>
            </li>
          )
        })}
      </ul>
    </ListPageShell>
  )
}