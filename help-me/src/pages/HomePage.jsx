import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUp, ShieldCheck, Sparkles } from 'lucide-react'
import { getSessionTickets, initializeSession } from '../api/sessionsApi'
import { STATUS_META, DEFAULT_STATUS, formatDate } from '../utils/ui'
import {
  FEATURES,
  FAQ_ITEMS,
  MAX_INPUT_LENGTH,
  SHORTCUTS,
} from '../mock/data'
import FaqAccordion from '../components/common/FaqAccordion'

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? DEFAULT_STATUS
  const Icon = meta.icon
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.badge}`}
    >
      <Icon className="size-3" aria-hidden="true" />
      {meta.label}
    </span>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const textareaRef = useRef(null)

  // Подстановка текста из каталога услуг (navigate('/', { state: { prompt } }))
  const [text, setText] = useState(() => location.state?.prompt ?? '')
  const [recent, setRecent] = useState([])

  useEffect(() => {
    let cancelled = false
    initializeSession()
      .then(({ session_id: sessionId }) => getSessionTickets(sessionId))
      .then((list) => {
        if (!cancelled) setRecent(list.slice(0, 5))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const trimmed = text.trim()
  const canSend = trimmed.length > 0
  const remaining = MAX_INPUT_LENGTH - text.length

  const growTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`
  }

  const submit = () => {
    if (!canSend) return
    navigate('/chat/new', { state: { initialPrompt: trimmed } })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const applyShortcut = (prompt) => {
    setText(prompt)
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      growTextarea()
    })
  }

  return (
    <>
      {/* ============ HERO + КОМПОЗЕР ============ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/80 via-brand-50/10 to-transparent">
        <div className="page-container flex flex-col items-center pb-16 pt-14 text-center sm:pb-20 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
            <Sparkles className="size-3.5 text-brand-500" aria-hidden="true" />
            ИИ-ассистент службы поддержки криптобиржи
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Добро пожаловать в{' '}
            <span className="whitespace-nowrap text-brand-600">CryptoAssist</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
            Опишите проблему — я помогу разобраться и подскажу дальнейшие шаги.
          </p>

          {/* Композер */}
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submit()
            }}
            className="mt-10 w-full max-w-2xl"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100 sm:p-4">
              <div className="flex items-start gap-3">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value.slice(0, MAX_INPUT_LENGTH))
                    growTextarea()
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={growTextarea}
                  rows={1}
                  maxLength={MAX_INPUT_LENGTH}
                  aria-label="Опишите проблему"
                  placeholder="Опишите проблему, например: не могу вывести средства..."
                  className="min-h-14 flex-1 resize-none bg-transparent py-1.5 text-base text-slate-800 outline-none placeholder:text-slate-400 md:text-lg"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  title="Отправить запрос (Enter)"
                  aria-label="Отправить запрос"
                  className={`grid size-12 shrink-0 place-items-center rounded-xl transition-all ${
                    canSend
                      ? 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:scale-[0.96]'
                      : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                  }`}
                >
                  <ArrowUp className="size-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pb-1 pt-3">
                <div className="flex flex-wrap gap-2" aria-label="Быстрые вопросы">
                  {SHORTCUTS.map((shortcut) => {
                    const Icon = shortcut.icon
                    return (
                      <button
                        key={shortcut.id}
                        type="button"
                        onClick={() => applyShortcut(shortcut.prompt)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Icon className="size-4 text-brand-500" aria-hidden="true" />
                        {shortcut.label}
                      </button>
                    )
                  })}
                </div>

                <span
                  className={`text-xs font-medium tabular-nums ${
                    remaining <= 0
                      ? 'text-rose-500'
                      : remaining < 50
                        ? 'text-amber-500'
                        : 'text-slate-400'
                  }`}
                >
                  {remaining} / {MAX_INPUT_LENGTH}
                </span>
              </div>
            </div>

            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="size-3.5 text-brand-400" aria-hidden="true" />
              Enter — отправить · Shift+Enter — новая строка · до 500 символов
            </p>
          </form>
        </div>
      </section>
      {/* ============ ПРЕИМУЩЕСТВА ============ */}
      <section className="page-container py-14 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.id}
                className="card p-6 transition-shadow hover:shadow-md"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-sm font-semibold text-slate-900">
                  {feature.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  {feature.text}
                </p>
              </div>
            )
          })}
        </div>
      </section>
      {/* ============ FAQ + ИСТОРИЯ ============ */}
      <section className="page-container grid gap-10 pb-20 lg:grid-cols-2">
        <div>
          <div className="mb-5 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Частые вопросы
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Короткие ответы на то, что спрашивают чаще всего.
              </p>
            </div>
          </div>
          <FaqAccordion items={FAQ_ITEMS} defaultOpenIndex={null} />
        </div>

        <div>
          <div className="mb-5 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Последние обращения
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Быстрый доступ к недавним диалогам и их статусам.
              </p>
            </div>
            <a
              href="/history"
              onClick={(event) => {
                event.preventDefault()
                navigate('/history')
              }}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              Все
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>

          <ul className="card divide-y divide-slate-100 overflow-hidden">
            {recent.length === 0 ? (
              <li className="px-5 py-6 text-center text-sm text-slate-400">
                Пока нет обращений — опишите проблему выше, и она появится здесь.
              </li>
            ) : (
              recent.map((ticket) => {
                const id = String(ticket.ticket_id ?? ticket.id)
                const title = ticket.preview_text ?? ticket.category ?? 'Обращение'
                return (
                  <li key={id}>
                    <a
                      href={`/chat/${id}`}
                      onClick={(event) => {
                        event.preventDefault()
                        navigate(`/chat/${id}`)
                      }}
                      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                        <ShieldCheck className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-sm font-medium text-slate-800 transition-colors group-hover:text-brand-700">
                          {title}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-400">
                          #{id} · {ticket.category ?? 'Без категории'} · {formatDate(ticket.created_at)}
                        </span>
                      </span>
                      <StatusBadge status={ticket.status} />
                      <ArrowRight
                        className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-brand-500"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </section>
    </>
  )
}