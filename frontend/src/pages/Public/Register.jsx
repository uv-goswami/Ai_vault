import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// ✅ Import updateBusiness and getBusinessByOwner instead of createBusiness
import { createUser, getBusinessByOwner, updateBusiness } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import '../../styles/register.css'

export default function Register() {
  const navigate = useNavigate()
  const { userId, login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    businessName: '',
    businessType: 'restaurant',
    businessAddress: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { email, password, name, businessName, businessType, businessAddress } = formData

    if (!email || !password || !businessName || !businessAddress) {
      setError('Please fill all required fields.')
      return
    }

    try {
      // 1. Create the User
      // (Your backend automatically creates a default "Business Profile" when this happens)
      const user = await createUser({
        email,
        name,
        auth_provider: 'password',
        password_hash: password
      })

      // 2. Log the user in immediately
      login(user.user_id)

      // 3. Fetch the default business that the BACKEND just created
      const business = await getBusinessByOwner(user.user_id)

      // 4. Update that existing business with the details the user just entered
      if (business) {
         await updateBusiness(business.business_id, {
             name: businessName,
             business_type: businessType,
             address: businessAddress
         })
      }

      // 5. Redirect to the correct dashboard
      navigate(`/dashboard/${business.business_id}`)

    } catch (err) {
      console.error(err)
      setError('Registration failed. Try again.')
    }
  }

  if (userId) {
    return (
      <div className="register-page">
        <div className="register-panel">
          <h2 className="register-title">You're already registered</h2>
          <p className="register-sub">
            Go to your <a href={`/dashboard/${userId}`}>Dashboard</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="register-page">
      <div className="register-panel">
        <h2 className="register-title">Create your account</h2>
        <p className="register-sub">Join AiVault and start enhancing your visibility</p>

        <form className="register-form" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            name="name"
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            name="businessName"
            type="text"
            placeholder="Business Name"
            value={formData.businessName}
            onChange={handleChange}
          />
          <select
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
          >
            <option value="restaurant">Restaurant</option>
            <option value="salon">Salon</option>
            <option value="clinic">Clinic</option>
          </select>
          <input
            name="businessAddress"
            type="text"
            placeholder="Business Address"
            value={formData.businessAddress}
            onChange={handleChange}
          />

          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn primary full-width">Register & Create Business</button>
        </form>

        <p className="register-footer">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  )
}