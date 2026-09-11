/**
 * Скелетон-карточка для loading state.
 */
export default function SkeletonCard() {
  return (
    <div className="animate-pulse flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <span className="size-10 shrink-0 rounded-xl bg-slate-200" />
      <span className="min-w-0 flex-1">
        <span className="block h-3 w-full rounded bg-slate-200" />
        <span className="mt-1.5 block h-3 w-3/5 rounded bg-slate-200" />
      </span>
      <span className="size-6 shrink-0 rounded-full bg-slate-200" />
    </div>
  )
}