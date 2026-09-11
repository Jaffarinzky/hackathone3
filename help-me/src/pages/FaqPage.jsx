import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { FAQ_CATEGORIES } from '../mock/data'
import FaqAccordion from '../components/common/FaqAccordion'
import ListPageShell from '../components/common/ListPageShell'

const TABS = [
  { id: 'all', name: 'Все' },
  ...FAQ_CATEGORIES.map(({ id, name }) => ({ id, name })),
]

export default function FaqPage() {
  const [activeTab, setActiveTab] = useState('all')

  const visibleItems =
    activeTab === 'all'
      ? FAQ_CATEGORIES.flatMap((category) => category.items)
      : FAQ_CATEGORIES.find((c) => c.id === activeTab)?.items ?? []

  return (
    <ListPageShell
      icon={<HelpCircle className="size-5" aria-hidden="true" />}
      title="Частые вопросы"
      subtitle="Ответы на популярные вопросы пользователей криптобиржи"
    >
      {/* Фильтр по категориям */}
      <div
        className="mb-5 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Категории вопросов"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Аккордеон */}
      <FaqAccordion
        key={activeTab}
        items={visibleItems}
        defaultOpenIndex={0}
      />

      <p className="mt-5 max-w-3xl text-xs leading-relaxed text-slate-400">
        Не нашли ответ? Опишите проблему ассистенту — он поможет с решением или
        передаст обращение специалисту.
      </p>
    </ListPageShell>
  )
}