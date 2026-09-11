import { ArrowLeft, Construction } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PagePlaceholder({
  icon: Icon = Construction,
  title = 'Раздел в разработке',
  description = 'Содержимое этого раздела появится на следующих этапах.',
  backLabel = 'На главную',
}) {
  return (
    <section className="page-container flex flex-1 items-center justify-center py-24">
      <div className="mx-auto max-w-md text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
          <Icon className="size-3.5" aria-hidden="true" />
          Скоро
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          {description}
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </Link>
      </div>
    </section>
  )
}