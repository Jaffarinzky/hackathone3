import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, History, Plus } from 'lucide-react'
import { getSessionTickets, initializeSession } from '../api/sessionsApi'
import { getPreviewIcon, formatDate, STATUS_META, DEFAULT_STATUS } from '../utils/ui'
import ListPageShell from '../components/common/ListPageShell'

export default function HistoryPage() {
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
      icon={<History className="size-5" aria-hidden="true" />}
      title="История обращений"
      subtitle="О чём вы раньше разговаривали с ассистентом"
      items={tickets}
      loading={loading}
      hasError={hasError}
      onRetry={retry}
      empty={{
        icon: Plus,
        title: 'Здесь появятся ваши обращения',
        description: 'Начните новое обращение, и здесь сохранится история ваших диалогов.',
      }}
    >
      <ul className="card divide-y divide-slate-100 overflow-hidden">
        {tickets.map((ticket) => {
          const preview = ticket.preview_text ?? ticket.category ?? 'Обращение'
          const Icon = getPreviewIcon(preview)
          const status = STATUS_META[ticket.status] ?? DEFAULT_STATUS
          const StatusIcon = status.icon
          return (
            <li key={ticket.ticket_id}>
              <Link
                to={`/chat/${ticket.ticket_id}`}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-medium text-slate-800 transition-colors group-hover:text-brand-700">
                    {preview}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    {formatDate(ticket.created_at)}
                  </span>
                </span>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.badge}`}
                >
                  <StatusIcon className="size-3" aria-hidden="true" />
                  {status.label}
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-brand-500"
                  aria-hidden="true"
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </ListPageShell>
  )
}