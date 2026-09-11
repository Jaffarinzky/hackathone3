import { useEffect, useState } from 'react'

/**
 * Локальное хранилище с JSON-сериализацией.
 * Пригодится для хранения недавних запросов, настроек, сессии.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Хранилище может быть недоступно — молча пропускаем.
    }
  }, [key, value])

  return [value, setValue]
}