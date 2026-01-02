import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom' // Added Link here
import { login as loginUser, getBusinessByOwner } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import '../../styles/login.css'

export default function Login() {
  // We extract 'login' and 'userId' from the context
  const { userId, login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // 1. Authenticate the User
      const user = await loginUser(formData.email, formData.password)
      
      // 2. Fetch the Business associated with this User
      const business = await getBusinessByOwner(user.user_id)
      
      // 3. Log in with BOTH IDs so the Navbar updates immediately
      login(user.user_id, business.business_id)
      
      // 4. Redirect to the Business Dashboard
      navigate(`/dashboard/${business.business_id}`)
    } catch (err) {
      console.error(err)
      setError('Login failed. Check credentials.')
    }
  }

  // If already logged in, show a friendly message
  if (userId) {
    return (
      <div className="login-page">
        <div className="login-panel">
          <h2 className="login-title">You're already logged in</h2>
          <p className="login-sub">
             {/* Note: We use a generic link here, or you could redirect automatically */}
             Go to your Dashboard
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <h2 className="login-title">Welcome back</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn primary full-width">Login</button>
        </form>

        {/* Added footer link for better navigation */}
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}