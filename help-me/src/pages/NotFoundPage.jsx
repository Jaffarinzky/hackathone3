import { Compass } from 'lucide-react'
import PagePlaceholder from '../components/common/PagePlaceholder'

export default function NotFoundPage() {
  return (
    <PagePlaceholder
      icon={Compass}
      title="Страница не найдена"
      description="Похоже, такой страницы не существует. Проверьте адрес или вернитесь на главную."
    />
  )
}