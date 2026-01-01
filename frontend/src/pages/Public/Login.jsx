    import React, { useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { login as loginUser, getBusinessByOwner } from '../../api/client'
    import { useAuth } from '../../context/AuthContext'
    import '../../styles/login.css'

    export default function Login() {
      const { userId, login } = useAuth()
      const navigate = useNavigate()
      const [formData, setFormData] = useState({ email: '', password: '' })
      const [error, setError] = useState('')

      const handleSubmit = async (e) => {
        e.preventDefault()
        try {
          const user = await loginUser(formData.email, formData.password)
          login(user.user_id)
          const business = await getBusinessByOwner(user.user_id)
          navigate(`/dashboard/${business.business_id}`)
        } catch {
          setError('Login failed. Check credentials.')
        }
      }

      if (userId) {
        return (
          <div className="login-page">
            <div className="login-panel">
              <h2 className="login-title">You're already logged in</h2>
              <p className="login-sub">Go to your <a href={`/dashboard/${userId}`}>Dashboard</a></p>
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
          </div>
        </div>
      )
    }
