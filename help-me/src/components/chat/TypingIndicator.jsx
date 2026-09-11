import { Coins } from 'lucide-react'

const DOTS = [
  { label: 'первая', delay: '0ms' },
  { label: 'вторая', delay: '150ms' },
  { label: 'третья', delay: '300ms' },
]

/**
 * Индикатор «печатает…» в стиле пузыря ассистента.
 */
export default function TypingIndicator({ label = 'CryptoAssist печатает' }) {
  return (
    <div className="flex items-start gap-3" role="status" aria-live="polite">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100" aria-hidden="true">
        <Coins className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-2.5">
          <span className="flex items-center gap-1.5">
            {DOTS.map((dot) => (
              <span
                key={dot.label}
                className="typing-dot"
                style={{ animationDelay: dot.delay }}
                aria-hidden="true"
              />
            ))}
          </span>
        </div>
        <span className="mt-1 block text-[11px] text-slate-400">{label}</span>
      </div>
    </div>
  )
}