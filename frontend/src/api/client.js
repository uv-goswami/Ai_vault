// src/api/client.js
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

async function api(path, init) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

// Auth
export const login = (email, password) =>
  api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })

// Users
export const createUser = (payload) =>
  api('/users', { method: 'POST', body: JSON.stringify(payload) })

export const getUserByEmail = (email) =>
  api(`/users/by-email/${encodeURIComponent(email)}`)

// Business
export const createBusiness = (payload) =>
  api('/business', { method: 'POST', body: JSON.stringify(payload) })

export const listBusinesses = (limit = 10, offset = 0) =>
  api(`/business?limit=${limit}&offset=${offset}`)

export const getBusiness = (businessId) =>
  api(`/business/${businessId}`)

export const getBusinessByOwner = (ownerId) =>
  api(`/business/by-owner/${ownerId}`)

// Services
export const createService = (payload) =>
  api('/services', { method: 'POST', body: JSON.stringify(payload) })

export const getService = (serviceId) =>
  api(`/services/${serviceId}`)

export const listServices = (businessId, limit = 10, offset = 0) =>
  api(`/services?business_id=${businessId}&limit=${limit}&offset=${offset}`)

// Media
export const uploadMediaFile = async (businessId, mediaType, file) => {
  const data = new FormData()
  data.append('business_id', businessId)
  data.append('media_type', mediaType)
  data.append('file', file)

  const res = await fetch(`${BASE}/media/upload`, {
    method: 'POST',
    body: data
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

export const getMedia = (mediaId) =>
  api(`/media/${mediaId}`)

export const listMedia = (businessId, limit = 10, offset = 0) =>
  api(`/media?business_id=${businessId}&limit=${limit}&offset=${offset}`)

export const deleteMedia = (mediaId) =>
  api(`/media/${mediaId}`, { method: 'DELETE' })

// Coupons
export const createCoupon = (payload) =>
  api('/coupons', { method: 'POST', body: JSON.stringify(payload) })

export const getCoupon = (couponId) =>
  api(`/coupons/${couponId}`)

export const listCoupons = (businessId, limit = 10, offset = 0) =>
  api(`/coupons?business_id=${businessId}&limit=${limit}&offset=${offset}`)

// AI Metadata
export const createAiMetadata = (payload) =>
  api('/ai-metadata', { method: 'POST', body: JSON.stringify(payload) })

export const getAiMetadata = (metadataId) =>
  api(`/ai-metadata/${metadataId}`)

export const listAiMetadata = (businessId, limit = 10, offset = 0) =>
  api(`/ai-metadata?business_id=${businessId}&limit=${limit}&offset=${offset}`)

export const generateAiMetadata = (businessId) =>
  api(`/ai-metadata/generate?business_id=${businessId}`, { method: 'POST' })

// Visibility
export const createVisibilityCheckRequest = (payload) =>
  api('/visibility/check', { method: 'POST', body: JSON.stringify(payload) })

export const listVisibilityChecks = (businessId, limit = 10, offset = 0) =>
  api(`/visibility/check?business_id=${businessId}&limit=${limit}&offset=${offset}`)

export const getVisibilityCheck = (checkId) =>
  api(`/visibility/check/${checkId}`)

export const createVisibilityResult = (payload) =>
  api('/visibility/result', { method: 'POST', body: JSON.stringify(payload) })

export const listVisibilityResults = (businessId, limit = 10, offset = 0) =>
  api(`/visibility/result?business_id=${businessId}&limit=${limit}&offset=${offset}`)

export const getVisibilityResult = (resultId) =>
  api(`/visibility/result/${resultId}`)

export const createVisibilitySuggestion = (payload) =>
  api('/visibility/suggestion', { method: 'POST', body: JSON.stringify(payload) })

export const listVisibilitySuggestions = (businessId, limit = 10, offset = 0) =>
  api(`/visibility/suggestion?business_id=${businessId}&limit=${limit}&offset=${offset}`)

export const getVisibilitySuggestion = (suggestionId) =>
  api(`/visibility/suggestion/${suggestionId}`)

export const runVisibility = (businessId) =>
  api(`/visibility/run?business_id=${businessId}`, { method: 'POST' })

// JSON-LD
export const generateJsonLD = (businessId) =>
  api(`/jsonld/generate?business_id=${businessId}`, { method: 'POST' })

export const listJsonLD = (businessId) =>
  api(`/jsonld?business_id=${businessId}`)

export const getJsonLD = (feedId) =>
  api(`/jsonld/${feedId}`)


// Operational Info
export const createOperationalInfo = (payload) =>
  api('/operational-info/', { method: 'POST', body: JSON.stringify(payload) })

// Get by business_id
export const getOperationalInfoByBusiness = (businessId) =>
  api(`/operational-info/by-business/${businessId}`)

// Update by business_id
export const updateOperationalInfoByBusiness = (businessId, payload) =>
  api(`/operational-info/by-business/${businessId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })

// Optional: Delete by business_id
export const deleteOperationalInfoByBusiness = (businessId) =>
  api(`/operational-info/by-business/${businessId}`, { method: 'DELETE' })


export const updateBusiness = (businessId, payload) =>
  api(`/business/${businessId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })

export const updateService = (serviceId, payload) =>
  api(`/services/${serviceId}`, { method: 'PATCH', body: JSON.stringify(payload) })

export const deleteService = (serviceId) =>
  api(`/services/${serviceId}`, { method: 'DELETE' })
