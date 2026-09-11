import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FaqAccordion({ items, defaultOpenIndex = 0 }) {
  const [openIndex, setOpenIndex] = useState(defaultOpenIndex)

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const open = index === openIndex
        return (
          <div
            key={item.q}
            className={`overflow-hidden rounded-xl border bg-white transition-colors ${
              open ? 'border-brand-200' : 'border-slate-200'
            }`}
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50/70"
            >
              <span className="text-sm font-medium text-slate-800">
                {item.q}
              </span>
              <ChevronDown
                className={`size-4 shrink-0 text-slate-400 transition-transform ${
                  open ? 'rotate-180 text-brand-600' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {open && (
              <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-500">
                {item.a}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}