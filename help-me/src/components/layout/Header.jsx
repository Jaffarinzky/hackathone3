import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, User, X } from 'lucide-react'
import Logo from '../common/Logo'
import Sidebar from './Sidebar'

const NAV_ITEMS = [
  { to: '/services', label: 'Разделы' },
  { to: '/tickets', label: 'Заявки' },
  { to: '/history', label: 'История' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contacts', label: 'Контакты' },
]

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand-50 text-brand-700'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <div onClick={closeMenu}>
          <Logo />
        </div>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Основная навигация"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 md:inline-flex"
          >
            <User className="size-4" aria-hidden="true" />
            Профиль
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
          >
            {menuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <Sidebar open={menuOpen} onClose={closeMenu} />
    </header>
  )
}