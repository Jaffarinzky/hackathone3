import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Headphones,
  HelpCircle,
  History,
  LayoutGrid,
  Ticket,
  User,
  X,
} from 'lucide-react'
import Logo from '../common/Logo'

const SIDEBAR_ITEMS = [
  { to: '/profile', label: 'Мой профиль', icon: User },
  { to: '/tickets', label: 'Мои заявки', icon: Ticket },
  { to: '/history', label: 'История обращений', icon: History },
  { to: '/services', label: 'Разделы поддержки', icon: LayoutGrid },
  { to: '/faq', label: 'Частые вопросы', icon: HelpCircle },
  { to: '/contacts', label: 'Контакты техподдержки', icon: Headphones },
]

/**
 * Навигационный drawer. Открывается кнопкой меню в Header,
 * закрывается по кнопке, overlay, Escape или после перехода на страницу.
 */
export default function Sidebar({ open, onClose }) {
  // Блокировка скролла body + закрытие по Escape
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <>
      {/* Затемнённый overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-slate-900/40 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Панель */}
      <aside
        id="app-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Меню навигации"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Шапка drawer */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть меню"
            className="grid size-9 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Пункты меню */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Меню">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Разделы
          </p>
          <ul className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Демо-пользователь */}
        <div className="shrink-0 border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
              AM
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-800">
                Alex Morgan
              </span>
              <span className="block truncate text-xs text-slate-400">
                Верифицирован
              </span>
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}