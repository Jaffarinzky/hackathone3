import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, RefreshCw, Search } from 'lucide-react'
import SkeletonCard from './SkeletonCard'

/**
 * Общий каркас для страниц-списков (/history и /tickets):
 * кнопка «Назад», заголовок, состояния загрузки/ошибки/пустоты.
 */
export default function ListPageShell({
  backTo = '/',
  icon,
  title,
  subtitle,
  items, // undefined → простой layout без loading/error/empty состояний
  loading,
  hasError,
  errorMessage = 'Не удалось загрузить данные',
  empty: {
    icon: EmptyIcon = Search,
    title: emptyTitle = 'Здесь пока пусто',
    description = '',
    actionLabel = 'Создать обращение',
    actionTo = '/',
  } = {},
  onRetry,
  children,
}) {
  return (
    <section className="page-container py-8 sm:py-12">
      {/* Шапка */}
      <div className="max-w-3xl">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Назад
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
            {icon}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="mt-8 max-w-3xl">
        {items === undefined ? (
          children
        ) : loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Загрузка данных">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : hasError ? (
          <div className="card flex flex-col items-center gap-3 p-8 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <RefreshCw className="size-6" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-slate-800">{errorMessage}</p>
            <p className="text-xs text-slate-400">
              Проверьте соединение и повторите попытку.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Попробовать снова
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
              <EmptyIcon className="size-6" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-slate-800">{emptyTitle}</p>
            <p className="max-w-sm text-center text-xs leading-relaxed text-slate-400">
              {description}
            </p>
            <Link
              to={actionTo}
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              <Plus className="size-4" aria-hidden="true" />
              {actionLabel}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">{children}</div>
        )}
      </div>
    </section>
  )
}