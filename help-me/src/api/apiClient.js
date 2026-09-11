import axios from 'axios'

/**
 * Централизованная конфигурация API «CryptoAssist» (контракт v2).
 * Все запросы идут на реальный backend через VITE_API_BASE_URL.
 * URL нигде не хардкодится — только через переменную окружения.
 *
 * Модель: session (localStorage → URL) → tickets → messages.
 */

/**
 * Нормализованная ошибка API.
 * UI получает только понятное сообщение + код — без AxiosError/stack trace.
 */
export class ApiError extends Error {
  constructor(message, status = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getFriendlyMessage(status) {
  if (status === 400) return 'Заявка уже закрыта или передана специалисту — новые сообщения недоступны.'
  if (status === 401 || status === 403) return 'Доступ запрещён. Обратитесь в поддержку.'
  if (status === 404) return 'Заявка или сессия не найдена.'
  if (status === 429) return 'Слишком много запросов. Подождите немного.'
  if (status >= 500) return 'Сервер временно недоступен. Попробуйте ещё раз.'
  return 'Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.'
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Сетевая ошибка (backend недоступен) — без status
    const status = error?.response?.status ?? null
    return Promise.reject(new ApiError(getFriendlyMessage(status), status))
  },
)

/**
 * Нормализует список: backend может вернуть массив или объект { tickets: [...] }.
 */
export function normalizeList(data, key) {
  if (Array.isArray(data)) return data
  return data?.[key] ?? []
}

export default apiClient