# CryptoAssist — frontend

Frontend AI-ассистента службы поддержки криптовалютной биржи.
React 19 + Vite + Tailwind CSS v4 + React Router + Axios + Lucide React.

## API-слой

Код приложения работает через единый API-слой (`src/api/`), компоненты НЕ
вызывают Axios напрямую.

- `src/api/apiClient.js` — централизованный Axios-клиент (base URL из
  `VITE_API_BASE_URL`), нормализованные ошибки `ApiError`.
- `src/api/sessionsApi.js` — `createSession()`, `initializeSession()`,
  `getSessionTickets()`, `createTicket()`.
- `src/api/ticketsApi.js` — `sendTicketMessage()`, `getTicketMessages()`,
  `resolveTicket()`, `rateTicket()`.

## Mock API

Пока backend не подключён, приложение работает автономно через Mock API
(`src/mock/mockApi.js`, данные — `src/mock/mockData.js`). Mock возвращает
ответы строго в формате реального API. AI-логики на frontend нет — mock
просто проигрывает заготовленный сценарий.

## Конфигурация окружения

Скопируйте `.env.example` в `.env`:

```dotenv
VITE_API_BASE_URL=http://BACKEND_URL_PLACEHOLDER/api/v1
```

## API-контракт

- `POST /sessions` — создание сессии (session_id сохраняется в localStorage)
- `GET /sessions/{session_id}/tickets` — список тикетов пользователя
- `POST /sessions/{session_id}/tickets` — создание тикета первым сообщением
- `POST /tickets/{ticket_id}/messages` — отправка сообщения в тикет
- `GET /tickets/{ticket_id}/messages` — история переписки тикета
- `PATCH /tickets/{ticket_id}/resolve` — закрытие тикета
- `PATCH /tickets/{ticket_id}/rating` — CSAT-оценка `{ "rate": 1..5 }`

## Демо-сценарий чата

1. `POST /sessions` → создание сессии
2. Сообщение пользователя → создаётся тикет → бот уточняет
3. Ответ пользователя → финальное решение (`is_final`, статус `open`)
4. Кнопка «Проблема решена» → `PATCH resolve` → статус `closed`
5. Оценка `PATCH /tickets/{id}/rating` → звёзды 1–5

## Команды

- `npm run dev` — dev-сервер
- `npm run build` — production-сборка
- `npm run lint` — oxlint
