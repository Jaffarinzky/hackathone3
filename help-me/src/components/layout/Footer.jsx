import { Link } from 'react-router-dom'
import { Clock, Mail, Phone } from 'lucide-react'
import Logo from '../common/Logo'

const FOOTER_LINKS = [
  { to: '/services', label: 'Разделы' },
  { to: '/tickets', label: 'Заявки' },
  { to: '/history', label: 'История' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contacts', label: 'Контакты' },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white">
      <div className="page-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            CryptoAssist — интеллектуальный ассистент службы поддержки
            криптовалютной биржи.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Разделы</h3>
          <ul className="mt-4 space-y-2.5">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-slate-500 transition-colors hover:text-brand-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Контакты</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
              +7 (000) 000-00-00
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
              support@example.com
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
              Онлайн-поддержка 24/7
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="page-container flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} CryptoAssist</p>
          <p>Интеллектуальный ассистент поддержки криптобиржи</p>
        </div>
      </div>
    </footer>
  )
}