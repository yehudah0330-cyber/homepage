import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './styles/theme.css'
import { applyFontStep, getFontStep } from './lib/prefs'
import Home from './pages/Home'
import Landing from './pages/Landing'
import Reserve from './pages/Reserve'
import Directions from './pages/Directions'
import Hours from './pages/Hours'
import Care from './pages/Care'
import Doctor from './pages/Doctor'
import MyReservations from './pages/MyReservations'
import Settings from './pages/Settings'
import Privacy from './pages/Privacy'
import AdminLayout from './pages/admin/AdminLayout'
import AdminReservations from './pages/admin/Reservations'
import AdminNotices from './pages/admin/Notices'
import AdminClosed from './pages/admin/ClosedDays'
import AdminAlerts from './pages/admin/Alerts'

applyFontStep(getFontStep())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Home />} />
        <Route path="/reserve" element={<Reserve />} />
        <Route path="/directions" element={<Directions />} />
        <Route path="/hours" element={<Hours />} />
        <Route path="/care" element={<Care />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/my" element={<MyReservations />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminReservations />} />
          <Route path="notices" element={<AdminNotices />} />
          <Route path="closed" element={<AdminClosed />} />
          <Route path="alerts" element={<AdminAlerts />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
