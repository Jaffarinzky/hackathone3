import { Clock, Headphones, Mail, Phone, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import ListPageShell from '../components/common/ListPageShell'

/**
 * Демонстрационные контактные данные — реальные появятся после подключения
 * backend. Пока используются placeholder-значения.
 */
const CONTACTS = [
  {
    id: 'email',
    icon: Mail,
    title: 'Email',
    value: 'support@example.com',
    href: 'mailto:support@example.com',
    hint: 'Ответим в течение рабочего дня',
  },
  {
    id: 'phone',
    icon: Phone,
    title: 'Телефон',
    value: '+7 (000) 000-00-00',
    href: 'tel:+70000000000',
    hint: 'Пн–Пт, 9:00–18:00',
  },
  {
    id: 'hours',
    icon: Clock,
    title: 'Часы работы',
    value: 'Онлайн-поддержка 24/7',
    href: null,
    hint: 'Операторы — в рабочие часы',
  },
]

export default function ContactsPage() {
  return (
    <ListPageShell
      icon={<Headphones className="size-5" aria-hidden="true" />}
      title="Контакты службы поддержки CryptoAssist"
      subtitle="Свяжитесь со специалистом, если автоматический помощник не смог решить проблему"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {CONTACTS.map((contact) => {
          const Icon = contact.icon
          const content = (
            <>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {contact.title}
                </span>
                <span className="mt-1 block truncate text-sm font-medium text-slate-800">
                  {contact.value}
                </span>
                <span className="mt-0.5 block text-xs text-slate-400">
                  {contact.hint}
                </span>
              </span>
            </>
          )

          return contact.href ? (
            <a
              key={contact.id}
              href={contact.href}
              className="card group flex items-start gap-4 p-5 transition-all hover:border-brand-200 hover:shadow-md"
            >
              {content}
            </a>
          ) : (
            <div
              key={contact.id}
              className="card flex items-start gap-4 p-5"
            >
              {content}
            </div>
          )
        })}
      </div>

      {/* Передача обращения специалисту */}
      <div className="card flex flex-col items-start gap-4 border-brand-200 bg-brand-50/60 p-6 sm:flex-row sm:items-center">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-sm">
          <Send className="size-5.5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            Передать обращение специалисту
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Опишите проблему ассистенту — если он не сможет помочь, обращение
            будет автоматически передано специалисту.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Send className="size-4" aria-hidden="true" />
          Создать обращение
        </Link>
      </div>

      <p className="max-w-3xl text-xs leading-relaxed text-slate-400">
        Контактные данные демонстрационные — реальные адрес и телефон появятся
        после подключения backend.
      </p>
    </ListPageShell>
  )
}