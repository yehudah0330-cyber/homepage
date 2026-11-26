import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './styles/theme.css'
import './styles/cinema.css'
import { applyFontStep, getFontStep } from './lib/prefs'
import Home from './pages/Home'
import SiteLayout from './site/SiteLayout'
import SiteHome from './site/Home'
import { ColumnList, ColumnView, DoctorPage, HoursPage, LocationPage, Treatment } from './site/Pages'
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
import AdminColumns from './pages/admin/Columns'
import AdminNotices from './pages/admin/Notices'
import AdminClosed from './pages/admin/ClosedDays'
import AdminAlerts from './pages/admin/Alerts'

applyFontStep(getFontStep())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<SiteHome />} />
          <Route path="/about" element={<Navigate to="/about/doctor" replace />} />
          <Route path="/about/doctor" element={<DoctorPage />} />
          <Route path="/about/hours" element={<HoursPage />} />
          <Route path="/about/location" element={<LocationPage />} />
          <Route path="/treatment/:id" element={<Treatment />} />
          <Route path="/column" element={<ColumnList />} />
          <Route path="/column/:id" element={<ColumnView />} />
        </Route>
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
          <Route path="columns" element={<AdminColumns />} />
          <Route path="closed" element={<AdminClosed />} />
          <Route path="alerts" element={<AdminAlerts />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
