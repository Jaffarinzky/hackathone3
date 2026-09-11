import { ArrowRight, LayoutGrid } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SERVICES } from '../mock/data'
import ListPageShell from '../components/common/ListPageShell'

export default function ServicesPage() {
  const navigate = useNavigate()

  return (
    <ListPageShell
      icon={<LayoutGrid className="size-5" aria-hidden="true" />}
      title="Разделы поддержки"
      subtitle="Выберите категорию поддержки криптобиржи"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {SERVICES.map((service) => {
          const Icon = service.icon
          return (
            <button
              key={service.id}
              type="button"
              onClick={() =>
                navigate('/', { state: { prompt: service.prompt } })
              }
              className="card group flex items-start gap-4 p-5 text-left transition-all hover:border-brand-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100 transition-colors group-hover:bg-brand-100">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900 transition-colors group-hover:text-brand-700">
                  {service.name}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-500">
                  {service.text}
                </span>
              </span>
              <ArrowRight
                className="size-4 shrink-0 self-center text-slate-300 transition-colors group-hover:translate-x-0.5 group-hover:text-brand-500"
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>

      <p className="max-w-3xl text-xs leading-relaxed text-slate-400">
        Выберите категорию — откроется чат с ассистентом, в котором описание
        проблемы уже будет подставлено.
      </p>
    </ListPageShell>
  )
}