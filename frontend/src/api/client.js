export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
export const BASE = API_BASE

// --- 🚀 SYSTEM DESIGN: CLIENT-SIDE CACHE ---
// Stores API responses in memory.
// Key = URL, Value = JSON Data
const REQUEST_CACHE = new Map()

// ✅ Helper to read cache synchronously (Essential for SWR Pattern)
export function getFromCache(path) {
  const url = `${BASE}${path}`
  return REQUEST_CACHE.get(url) || null
}

async function api(path, init = {}) {
  const url = `${BASE}${path}`
  const method = init.method || 'GET'

  // 1. CACHE HIT: If we have the data, return it INSTANTLY (0ms latency)
  if (method === 'GET' && REQUEST_CACHE.has(url)) {
    return REQUEST_CACHE.get(url)
  }

  // 2. NETWORK REQUEST
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  })

  // 3. ERROR HANDLING
  if (!res.ok) {
    const text = await res.text()

    // Special handling for 404 on operational info
    if (res.status === 404 && path.includes('operational-info')) {
        return null;
    }

    console.error(`API Error: ${res.status}`, text)
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const data = await res.json()

  // 4. CACHE SET: Store the result for next time
  if (method === 'GET') {
    REQUEST_CACHE.set(url, data)
  }

  // 5. CACHE INVALIDATION: Write-Through Logic
  if (['POST', 'PATCH', 'DELETE'].includes(method)) {
    REQUEST_CACHE.clear()
  }

  return data
}

// --- 🚀 NEW: PREFETCHING UTILITY ---
export const prefetch = (path) => {
  const url = `${BASE}${path}`
  if (!REQUEST_CACHE.has(url)) {
    api(path, { method: 'GET' }).catch(() => {})
  }
}

// --- AUTH ---
export const login = (email, password) =>
  api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })

// --- USERS ---
export const createUser = (payload) =>
  api('/users/', { method: 'POST', body: JSON.stringify(payload) })

export const getUserByEmail = (email) =>
  api(`/users/by-email/${encodeURIComponent(email)}`)

// --- BUSINESS ---

// ✅ NEW: Add this function to handle Directory Caching properly
export const getDirectoryView = () => 
  api('/business/directory-view')

export const createBusiness = (payload) =>
  api('/business/', { method: 'POST', body: JSON.stringify(payload) })

export const listBusinesses = (limit = 10, offset = 0) =>
  api(`/business/?limit=${limit}&offset=${offset}`)

export const getBusiness = (businessId) =>
  api(`/business/${businessId}`)

export const getBusinessByOwner = (ownerId) =>
  api(`/business/by-owner/${ownerId}`)

export const updateBusiness = (businessId, payload) =>
  api(`/business/${businessId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })

// --- SERVICES ---
export const createService = (payload) =>
  api('/services/', { method: 'POST', body: JSON.stringify(payload) })

export const getService = (serviceId) =>
  api(`/services/${serviceId}`)

export const listServices = (businessId, limit = 10, offset = 0) =>
  api(`/services/?business_id=${businessId}&limit=${limit}&offset=${offset}`)

export const updateService = (serviceId, payload) =>
  api(`/services/${serviceId}`, { method: 'PATCH', body: JSON.stringify(payload) })

export const deleteService = (serviceId) =>
  api(`/services/${serviceId}`, { method: 'DELETE' })

// --- OPERATIONAL INFO ---
export const createOperationalInfo = (payload) =>
  api('/operational-info/', { method: 'POST', body: JSON.stringify(payload) })

export const getOperationalInfoByBusiness = (businessId) =>
  api(`/operational-info/by-business/${businessId}`)

export const updateOperationalInfoByBusiness = (businessId, payload) =>
  api(`/operational-info/by-business/${businessId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })

export const deleteOperationalInfoByBusiness = (businessId) =>
  api(`/operational-info/by-business/${businessId}`, { method: 'DELETE' })

// --- MEDIA ---
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
  
  REQUEST_CACHE.clear()
  return res.json()
}

export const getMedia = (mediaId) =>
  api(`/media/${mediaId}`)

export const listMedia = (businessId, limit = 10, offset = 0) =>
  api(`/media/?business_id=${businessId}&limit=${limit}&offset=${offset}`)

export const deleteMedia = (mediaId) =>
  api(`/media/${mediaId}`, { method: 'DELETE' })

// --- COUPONS ---
export const createCoupon = (payload) =>
  api('/coupons/', { method: 'POST', body: JSON.stringify(payload) })

export const getCoupon = (couponId) =>
  api(`/coupons/${couponId}`)

export const listCoupons = (businessId, limit = 10, offset = 0) =>
  api(`/coupons/?business_id=${businessId}&limit=${limit}&offset=${offset}`)

// --- AI METADATA ---
export const createAiMetadata = (payload) =>
  api('/ai-metadata/', { method: 'POST', body: JSON.stringify(payload) })

export const getAiMetadata = (metadataId) =>
  api(`/ai-metadata/${metadataId}`)

export const listAiMetadata = (businessId, limit = 10, offset = 0) =>
  api(`/ai-metadata/?business_id=${businessId}&limit=${limit}&offset=${offset}`)

export const generateAiMetadata = (businessId) =>
  api(`/ai-metadata/generate?business_id=${businessId}`, { method: 'POST' })

// --- JSON-LD ---
export const generateJsonLD = (businessId) =>
  api(`/jsonld/generate?business_id=${businessId}`, { method: 'POST' })

export const listJsonLD = (businessId) =>
  api(`/jsonld/?business_id=${businessId}`)

export const getJsonLD = (feedId) =>
  api(`/jsonld/${feedId}`)