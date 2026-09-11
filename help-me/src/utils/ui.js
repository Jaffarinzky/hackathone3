import {
  BadgeCheck,
  Banknote,
  CandlestickChart,
  Check,
  CircleAlert,
  Clock,
  Coins,
  KeyRound,
  Laptop,
  Lock,
  LogIn,
  Mail,
  Monitor,
  Package,
  Send,
  ShieldCheck,
  Ticket,
  User,
  Wifi,
} from 'lucide-react'

/**
 * Утилиты UI (без JSX): маппинги статусов/категорий и форматирование дат.
 * Значения API не изменяются — меняется только их отображение.
 */

export const STATUS_META = {
  open: {
    label: 'В работе',
    icon: Clock,
    badge: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100',
  },
  needs_specialist: {
    label: 'Ожидает специалиста',
    icon: User,
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/70',
  },
  closed: {
    label: 'Закрыто',
    icon: Check,
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/70',
  },
}

export const DEFAULT_STATUS = {
  label: 'Неизвестно',
  icon: CircleAlert,
  badge: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
}

export const DEFAULT_CATEGORY_ICON = Ticket

/** Подбирает иконку по названию категории. */
export function getCategoryIcon(category = '') {
  const lower = category.toLowerCase()
  // Криптобиржевые категории (CryptoAssist)
  if (lower.includes('аккаунт') || lower.includes('вход')) return KeyRound
  if (lower.includes('безопасн')) return Lock
  if (lower.includes('верификац')) return BadgeCheck
  if (lower.includes('пополнен')) return Coins
  if (lower.includes('вывод')) return Banknote
  if (lower.includes('перевод') || lower.includes('транзакц')) return Send
  if (lower.includes('торговл') || lower.includes('ордер')) return CandlestickChart
  if (lower.includes('доступ') || lower.includes('восстанов')) return LogIn
  if (lower.includes('другое')) return Ticket
  // Совместимость со старыми значениями backend
  if (lower.includes('wi-fi') || lower.includes('wifi')) return Wifi
  if (lower.includes('vpn')) return ShieldCheck
  if (lower.includes('почт')) return Mail
  if (lower.includes('оборуд')) return Monitor
  if (lower.includes('рабочее')) return Laptop
  if (lower.includes('по')) return Package
  return DEFAULT_CATEGORY_ICON
}

/** Форматирует ISO-дату в вид «10 сентября 2026». */
export function formatDate(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '—'
  const monthNames = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

const PREVIEW_ICONS = {
  // Криптобиржевые темы (CryptoAssist)
  вывод: Banknote,
  пополнен: Coins,
  верификац: BadgeCheck,
  '2fa': Lock,
  аккаунт: KeyRound,
  вход: KeyRound,
  перевод: Send,
  транзакц: Send,
  ордер: CandlestickChart,
  торговл: CandlestickChart,
  заморож: Lock,
  безопасн: ShieldCheck,
  // Совместимость со старыми текстами
  vpn: ShieldCheck,
  wifi: Wifi,
  почт: Mail,
  доступ: LogIn,
}

/** Иконка превью истории по тексту. */
export function getPreviewIcon(previewText = '') {
  const lower = previewText.toLowerCase()
  const key = [
    'вывод', 'пополнен', 'верификац', '2fa', 'аккаунт', 'вход',
    'перевод', 'транзакц', 'ордер', 'торговл', 'заморож', 'безопасн',
    'vpn', 'wifi', 'почт', 'доступ',
  ].find((k) => lower.includes(k))
  return PREVIEW_ICONS[key] ?? DEFAULT_CATEGORY_ICON
}