import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { userId, logout } = useAuth()
  const navigate = useNavigate()   // ✅ add navigate hook

  const handleLogout = () => {
    logout()           // clear auth state
    navigate("/")      // ✅ redirect to home page
  }

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="logo">AiVault</Link>

        <div className="nav-links">
          <NavLink to="/" className="nav-item">Home</NavLink>
          <NavLink to="/directory" className="nav-item">Directory</NavLink>
          {userId && <NavLink to={`/dashboard/${userId}`} className="nav-item">Dashboard</NavLink>}
        </div>

        <div className="nav-right">
          {userId ? (
            <>
              <span className="nav-item">Logged in</span>
              <button onClick={handleLogout} className="nav-item">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-item">Login</NavLink>
              <NavLink to="/register" className="nav-item nav-cta">Sign Up</NavLink>
            </>
          )}
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </div>

      {menuOpen && (
        <div className="nav-mobile">
          <NavLink to="/" className="nav-item" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/directory" className="nav-item" onClick={() => setMenuOpen(false)}>Directory</NavLink>
          {userId && <NavLink to={`/dashboard/${userId}`} className="nav-item" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>}
          {userId ? (
            <button
              onClick={() => { handleLogout(); setMenuOpen(false) }}
              className="nav-item"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className="nav-item" onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink to="/register" className="nav-item nav-cta" onClick={() => setMenuOpen(false)}>Sign Up</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
  