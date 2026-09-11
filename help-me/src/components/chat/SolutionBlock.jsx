import { ListChecks } from 'lucide-react'

/**
 * Структурированное отображение пошагового решения.
 * Принимает обычный text: строки переносов превращаются в нумерованные шаги.
 */
export default function SolutionBlock({ title = 'Решение проблемы', text }) {
  const steps = String(text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-white px-4 py-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
          <ListChecks className="size-4" aria-hidden="true" />
        </span>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>

      <ol className="space-y-2.5 px-4 py-4">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-[11px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-100 tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="min-w-0 flex-1 text-sm leading-relaxed text-slate-700">
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}