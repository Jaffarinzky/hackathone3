import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import HistoryPage from './pages/HistoryPage'
import TicketsPage from './pages/TicketsPage'
import ServicesPage from './pages/ServicesPage'
import FaqPage from './pages/FaqPage'
import ProfilePage from './pages/ProfilePage'
import ContactsPage from './pages/ContactsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="chat/:ticketId" element={<ChatPage />} />
        <Route path="chat/new" element={<ChatPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
