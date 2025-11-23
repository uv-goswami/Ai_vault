import React, { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import '../styles/theme.css'

export default function SidebarNav() {
  const [open, setOpen] = useState(true)
  const { id } = useParams() // business UUID

  return (
    <aside className={`sidebar ${open ? 'open' : 'collapsed'}`}>
      <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
        {open ? '⟨' : '⟩'}
      </button>
      {open && (
        <nav>
          <NavLink
            to={`/dashboard/${id}`}
            end   // ✅ exact match only
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Overview
          </NavLink>
          <NavLink
            to={`/dashboard/${id}/profile`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Profile
          </NavLink>
          <NavLink
            to={`/dashboard/${id}/services`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Services
          </NavLink>
          <NavLink
            to={`/dashboard/${id}/media`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Media
          </NavLink>
          <NavLink
            to={`/dashboard/${id}/metadata`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Metadata
          </NavLink>
          <NavLink
            to={`/dashboard/${id}/coupons`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Coupons
          </NavLink>
          <NavLink
            to={`/dashboard/${id}/visibility`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Visibility
          </NavLink>
          <NavLink
            to={`/dashboard/${id}/jsonld`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            JSON‑LD Feeds
          </NavLink>
          <NavLink
            to={`/dashboard/${id}/operational-info`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Operational Info
          </NavLink>
        </nav>
      )}
    </aside>
  )
}
