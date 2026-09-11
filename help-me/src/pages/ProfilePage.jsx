import { Mail, ShieldCheck, User } from 'lucide-react'
import ListPageShell from '../components/common/ListPageShell'

/**
 * Демонстрационный профиль пользователя криптобиржи.
 * Реальные данные появятся после подключения авторизации — значения ниже
 * являются placeholder.
 */
const DEMO_PROFILE = {
  initials: 'AM',
  fullName: 'Alex Morgan',
  department: 'Пользователь CryptoAssist',
  email: 'alex@example.com',
  role: 'Верифицирован',
  accountId: 'demo-user-001',
}

export default function ProfilePage() {
  return (
    <ListPageShell
      icon={<User className="size-5" aria-hidden="true" />}
      title="Мой профиль"
      subtitle="Демонстрационные данные учётной записи"
    >
      <div className="card overflow-hidden">
        {/* Основная карточка профиля */}
        <div className="flex flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:items-start sm:text-left">
          <span
            className="grid size-20 shrink-0 place-items-center rounded-full bg-brand-600 text-2xl font-bold text-white shadow-sm"
            aria-hidden="true"
          >
            {DEMO_PROFILE.initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {DEMO_PROFILE.fullName}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-100">
                <ShieldCheck className="size-3" aria-hidden="true" />
                Демо-данные
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {DEMO_PROFILE.department}
            </p>
            <a
              href={`mailto:${DEMO_PROFILE.email}`}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              <Mail className="size-4" aria-hidden="true" />
              {DEMO_PROFILE.email}
            </a>
          </div>
        </div>

        {/* Детали */}
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-slate-100 px-6 py-5 sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Профиль пользователя
            </dt>
            <dd className="mt-1 text-sm text-slate-800">
              {DEMO_PROFILE.department}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Статус верификации
            </dt>
            <dd className="mt-1 text-sm text-slate-800">{DEMO_PROFILE.role}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Email
            </dt>
            <dd className="mt-1 truncate text-sm text-slate-800">
              {DEMO_PROFILE.email}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              ID учётной записи
            </dt>
            <dd className="mt-1 text-sm text-slate-800 tabular-nums">
              {DEMO_PROFILE.accountId}
            </dd>
          </div>
        </dl>
      </div>

      <p className="max-w-3xl text-xs leading-relaxed text-slate-400">
        Это демонстрационный профиль. Реальные данные учётной записи появятся
        после подключения авторизации и backend.
      </p>
    </ListPageShell>
  )
}