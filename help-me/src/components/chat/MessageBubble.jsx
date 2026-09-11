import { Coins } from 'lucide-react'

/**
 * Пузырь сообщения в чате.
 * Сообщения пользователя — справа (зелёный), ассистента — слева (светлый).
 */
export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%]">
          <div className="whitespace-pre-line rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-sm leading-relaxed text-white">
            {message.content}
          </div>
          <time className="mt-1 block text-[11px] text-slate-400">
            {message.time}
          </time>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100" aria-hidden="true">
        <Coins className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="whitespace-pre-line rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700">
          {message.content}
        </div>
        <time className="mt-1 block text-[11px] text-slate-400">
          {message.time}
        </time>
      </div>
    </div>
  )
}