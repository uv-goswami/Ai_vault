import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import { AuthProvider } from './context/AuthContext'

// Public pages
import Home from './pages/Public/Home'
import Login from './pages/Public/Login'
import Register from './pages/Public/Register'
import Directory from './pages/Public/Directory'
import BusinessProfile from './pages/Public/BusinessProfile'

// Dashboard modules
import DashboardHome from './pages/Dashboard/DashboardHome'
import Profile from './pages/Dashboard/Profile'
import Services from './pages/Dashboard/Services'
import Media from './pages/Dashboard/Media'
import Metadata from './pages/Dashboard/Metadata'
import Coupons from './pages/Dashboard/Coupons'
import Visibility from './pages/Dashboard/Visibility'
import JsonLD from './pages/Dashboard/JsonLD'
import OperationalInfo from './pages/Dashboard/OperationalInfo'

// Optional: simple 404 fallback
function NotFound() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Landing & Auth */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public */}
          <Route path="/directory" element={<Directory />} />
          <Route path="/business/:id" element={<BusinessProfile />} />

          {/* Dashboard */}
          <Route path="/dashboard/:id" element={<DashboardHome />} />
          <Route path="/dashboard/:id/profile" element={<Profile />} />
          <Route path="/dashboard/:id/services" element={<Services />} />
          <Route path="/dashboard/:id/media" element={<Media />} />
          <Route path="/dashboard/:id/metadata" element={<Metadata />} />
          <Route path="/dashboard/:id/coupons" element={<Coupons />} />
          <Route path="/dashboard/:id/visibility" element={<Visibility />} />
          <Route path="/dashboard/:id/jsonld" element={<JsonLD />} />
          <Route path="/dashboard/:id/operational-info" element={<OperationalInfo />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}
