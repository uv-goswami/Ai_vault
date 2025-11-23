import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null)
  const [businessId, setBusinessId] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user_id')
    const storedBusiness = localStorage.getItem('business_id')
    if (storedUser) setUserId(storedUser)
    if (storedBusiness) setBusinessId(storedBusiness)
  }, [])

  const login = (userId, businessId) => {
    localStorage.setItem('user_id', userId)
    setUserId(userId)
    if (businessId) {
      localStorage.setItem('business_id', businessId)
      setBusinessId(businessId)
    }
  }

  const logout = () => {
    localStorage.removeItem('user_id')
    localStorage.removeItem('business_id')
    setUserId(null)
    setBusinessId(null)
  }

  return (
    <AuthContext.Provider value={{ userId, businessId, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
