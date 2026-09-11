import { Coins } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Logo({ compact = false }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-700 text-white shadow-sm transition-colors group-hover:bg-brand-800">
        <Coins className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-semibold text-slate-900">
            CryptoAssist
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            CRYPTO ASSIST
          </span>
        </span>
      )}
    </Link>
  )
}