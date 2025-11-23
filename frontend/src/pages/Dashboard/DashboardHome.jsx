import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
import StatCard from '../../components/StatCard'
import '../../styles/dashboard.css'

export default function DashboardHome() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [profileOk, setProfileOk] = useState(false)
  const [serviceCount, setServiceCount] = useState(0)
  const [visibilityScore, setVisibilityScore] = useState('—')

  useEffect(() => {
    loadProfile()
    loadServices()
    loadVisibility()
  }, [id])

  async function loadProfile() {
    try {
      const res = await fetch(`http://localhost:8000/business/${id}`)
      setProfileOk(res.ok)
    } catch (err) {
      console.error(err)
      setProfileOk(false)
    }
  }

  async function loadServices() {
    try {
      const res = await fetch(`http://localhost:8000/services?business_id=${id}&limit=100&offset=0`)
      if (res.ok) {
        const data = await res.json()
        setServiceCount(Array.isArray(data) ? data.length : 0)
      } else {
        setServiceCount(0)
      }
    } catch (err) {
      console.error(err)
      setServiceCount(0)
    }
  }

  async function loadVisibility() {
    try {
      const res = await fetch(`http://localhost:8000/visibility/result?business_id=${id}&limit=1&offset=0`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setVisibilityScore(data[0].visibility_score)
        } else {
          setVisibilityScore('—')
        }
      } else {
        setVisibilityScore('—')
      }
    } catch (err) {
      console.error(err)
      setVisibilityScore('—')
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
