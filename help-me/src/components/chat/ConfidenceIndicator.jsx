/**
 * Индикатор уверенности системы (0–100).
 * score = null/undefined → «нет данных» (не показываем ложный 0%).
 */
function getConfidenceTier(value) {
  if (value >= 85) {
    return { label: 'Высокая уверенность', bar: 'bg-brand-500', text: 'text-brand-700' }
  }
  if (value >= 31) {
    return { label: 'Требуется уточнение', bar: 'bg-amber-500', text: 'text-amber-700' }
  }
  return { label: 'Низкая уверенность', bar: 'bg-rose-500', text: 'text-rose-700' }
}

export default function ConfidenceIndicator({ score = null }) {
  const hasValue = score !== null && score !== undefined && !Number.isNaN(Number(score))

  if (!hasValue) {
    return (
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-400">Нет данных</span>
          <span className="shrink-0 text-xs font-semibold text-slate-400 tabular-nums">—</span>
        </div>
        <div
          role="meter"
          aria-valuenow="0"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Уверенность системы неизвестна"
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"
        >
          <div className="h-full rounded-full bg-slate-200" style={{ width: '0%' }} />
        </div>
      </div>
    )
  }

  const value = Math.max(0, Math.min(100, Math.round(Number(score) || 0)))
  const tier = getConfidenceTier(value)

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-medium ${tier.text}`}>{tier.label}</span>
        <span className="shrink-0 text-xs font-semibold text-slate-700 tabular-nums">
          {value}%
        </span>
      </div>
      <div
        role="meter"
        aria-valuenow={value}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={tier.label}
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${tier.bar}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}