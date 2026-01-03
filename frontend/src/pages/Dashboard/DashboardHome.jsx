import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
import StatCard from '../../components/StatCard'
import '../../styles/dashboard.css'
// ✅ Import API_BASE and the new getFromCache helper
import { API_BASE, getFromCache } from '../../api/client'

export default function DashboardHome() {
  const { id } = useParams()
  const navigate = useNavigate()

  // 🚀 SYSTEM DESIGN: Instant Load via Cache
  // We initialize state by checking if data exists in memory.
  // If yes, the user sees "✓" or numbers immediately (0ms latency).
  
  const [profileOk, setProfileOk] = useState(() => {
    const cached = getFromCache(`/business/${id}`)
    return !!cached
  })

  const [serviceCount, setServiceCount] = useState(() => {
    const cached = getFromCache(`/services/?business_id=${id}&limit=100&offset=0`)
    return Array.isArray(cached) ? cached.length : 0
  })

  const [visibilityScore, setVisibilityScore] = useState(() => {
    const cached = getFromCache(`/visibility/result?business_id=${id}&limit=1&offset=0`)
    if (Array.isArray(cached) && cached.length > 0) {
      return cached[0].visibility_score
    }
    return '—'
  })

  // 🚀 REVALIDATION: Background Fetch
  // The useEffect runs *after* the initial render to check for updates.
  useEffect(() => {
    loadProfile()
    loadServices()
    loadVisibility()
  }, [id])

  async function loadProfile() {
    try {
      const res = await fetch(`${API_BASE}/business/${id}`)
      setProfileOk(res.ok)
    } catch (err) {
      console.error(err)
      if (!profileOk) setProfileOk(false) // Only overwrite if we didn't have cache
    }
  }

  async function loadServices() {
    try {
      const res = await fetch(`${API_BASE}/services?business_id=${id}&limit=100&offset=0`)
      if (res.ok) {
        const data = await res.json()
        setServiceCount(Array.isArray(data) ? data.length : 0)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function loadVisibility() {
    try {
      const res = await fetch(`${API_BASE}/visibility/result?business_id=${id}&limit=1&offset=0`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setVisibilityScore(data[0].visibility_score)
        } else {
          setVisibilityScore('—')
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <SidebarNav />
      </div>
      <div className="dashboard-content">
        <h2 className="page-title">Dashboard Overview</h2>
        <div className="grid">
          <StatCard
            title="Profile"
            value={profileOk ? '✓' : '✗'}
            onClick={() => navigate(`/dashboard/${id}/profile`)}
          />
          <StatCard
            title="Services"
            value={serviceCount}
            onClick={() => navigate(`/dashboard/${id}/services`)}
          />
          <StatCard
            title="Visibility Score"
            value={visibilityScore}
            onClick={() => navigate(`/dashboard/${id}/visibility`)}
          />
        </div>
      </div>
    </div>
  )
}