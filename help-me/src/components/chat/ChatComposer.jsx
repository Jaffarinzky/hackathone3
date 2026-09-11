import { useRef, useState } from 'react'
import { ArrowUp, LoaderCircle } from 'lucide-react'
import { MAX_INPUT_LENGTH } from '../../mock/data'

const MAX_HEIGHT = 144
const MIN_HEIGHT = 56

/**
 * Нижний фиксированный композер чата: auto-grow textarea,
 * счётчик символов, кнопка отправки с loading-состоянием.
 *
 * @param {Function} onSend вызывается с текстом сообщения
 * @param {boolean} disabled блокирует ввод (typing / завершено / нет сессии)
 * @param {boolean} busy показывает спиннер вместо стрелки (бот отвечает)
 * @param {string} disabledPlaceholder текст placeholder в заблокированном состоянии
 */
export default function ChatComposer({
  onSend,
  disabled = false,
  busy = disabled,
  disabledPlaceholder = 'Ассистент отвечает…',
}) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  const trimmed = text.trim()
  const canSend = trimmed.length > 0 && !disabled
  const remaining = MAX_INPUT_LENGTH - text.length

  const growTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT)}px`
  }

  const submit = () => {
    if (!canSend) return
    onSend(trimmed)
    setText('')
    requestAnimationFrame(growTextarea)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="w-full"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={text}
            disabled={disabled}
            onChange={(event) => {
              setText(event.target.value.slice(0, MAX_INPUT_LENGTH))
              growTextarea()
            }}
            onKeyDown={handleKeyDown}
            onFocus={growTextarea}
            rows={1}
            maxLength={MAX_INPUT_LENGTH}
            aria-label="Сообщение ассистенту"
            placeholder={
              disabled
                ? disabledPlaceholder
                : 'Опишите проблему, например: не могу вывести средства...'
            }
            className={`min-h-14 max-h-36 flex-1 resize-none bg-transparent py-1.5 text-base text-slate-800 outline-none placeholder:text-slate-400 ${
              disabled ? 'opacity-60 pointer-events-none' : ''
            }`}
          />
          <button
            type="submit"
            disabled={!canSend}
            title={busy ? 'Ассистент отвечает…' : disabled ? 'Ввод недоступен' : 'Отправить (Enter)'}
            aria-label="Отправить сообщение"
            className={`grid size-11 shrink-0 place-items-center rounded-xl transition-all ${
              canSend
                ? 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:scale-[0.96]'
                : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
            }`}
          >
            {busy ? (
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowUp className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pb-1 pt-3">
          <span className="text-xs text-slate-400">
            Enter — отправить · Shift+Enter — новая строка
          </span>
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
    </form>
  )
}