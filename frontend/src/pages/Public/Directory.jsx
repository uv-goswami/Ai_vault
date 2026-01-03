import React, { useEffect, useState } from "react"
// ✅ Import getFromCache
import { API_BASE, getFromCache } from "../../api/client"
import "../../styles/directory.css"

export default function Directory() {
  // 🚀 INSTANT LOAD: Initialize state from cache
  const [businesses, setBusinesses] = useState(() => {
    const cached = getFromCache('/business/directory-view')
    // Ensure we handle the data mapping if it exists in cache
    if (Array.isArray(cached)) {
       return cached.map((biz) => ({
        ...biz,
        hours: biz.operational_info,
      }))
    }
    return []
  })
  
  // Only show loading spinner if we strictly have NO data
  const [loading, setLoading] = useState(() => businesses.length === 0)

  // 🚀 REVALIDATE: Fetch fresh data in background
  useEffect(() => {
    loadDirectory()
  }, [])

  async function loadDirectory() {
    if (businesses.length === 0) setLoading(true)
    try {
      // ✅ SYSTEM DESIGN OPTIMIZATION: Aggregated Fetch
      const res = await fetch(`${API_BASE}/business/directory-view`)
      
      if (!res.ok) {
        throw new Error(`Directory fetch failed: ${res.statusText}`)
      }

      const data = await res.json()

      // Map Backend -> UI structure
      const formattedData = data.map((biz) => ({
        ...biz,
        hours: biz.operational_info,
      }))

      setBusinesses(formattedData)
    } catch (err) {
      console.error("Failed to load directory:", err)
      // Only set empty if we really failed and had nothing
      if (businesses.length === 0) setBusinesses([])
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }

  return (
    <div className="directory-page container">
      <h1 className="directory-title">Business Directory</h1>
      <p className="directory-sub">
        Explore AI-ready local businesses and services.
      </p>

      {loading ? (
        <div className="muted">Loading directory...</div>
      ) : businesses.length === 0 ? (
        <div className="muted">No businesses found.</div>
      ) : (
        <div className="directory-grid">
          {businesses.map((biz) => (
            <article
              key={biz.business_id}
              className="directory-card"
              itemScope
              itemType="https://schema.org/LocalBusiness"
              style={{ padding: '20px' }}
            >
              {/* Header with small Logo layout */}
              <header className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                
                {/* Logo Section */}
                {biz.media && biz.media.length > 0 ? (
                  <img
                    src={getImageUrl(biz.media[0].url)}
                    alt={biz.name}
                    style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        border: '1px solid #eee',
                        flexShrink: 0 
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : null}

                {/* Text Section */}
                <div style={{ flexGrow: 1 }}>
                    <h2 itemProp="name" style={{ margin: 0, fontSize: '1.3rem' }}>{biz.name}</h2>
                    <span className="biz-type" style={{ display:'block', marginTop:'4px', fontSize:'0.9rem', color:'#666' }}>
                    {biz.business_type || "Business"}
                    </span>
                </div>
              </header>

              {/* Description */}
              {biz.description && (
                <p className="card-description" itemProp="description" style={{ marginBottom: '15px' }}>
                  {biz.description.length > 90 
                    ? biz.description.substring(0, 90) + "..." 
                    : biz.description}
                </p>
              )}

              {/* Details */}
              <div className="card-meta">
                <p>
                  <strong>📍 Location:</strong>{" "}
                  <span itemProp="address">{biz.address || "Online / Remote"}</span>
                </p>

                {biz.hours && (
                  <p>
                    <strong>🕒 Hours:</strong>{" "}
                    <span itemProp="openingHours">
                        {biz.hours.opening_time} - {biz.hours.closing_time}
                    </span>
                  </p>
                )}

                {/* Services Count */}
                {biz.services.length > 0 && (
                  <p>
                    <strong>🛠 Services:</strong> {biz.services.length} available
                  </p>
                )}

                {/* Coupon Badge */}
                {biz.coupons.length > 0 && (
                  <div style={{
                    marginTop: '10px', 
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#e6f4ea',
                    color: '#1e7e34',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    🎟 {biz.coupons.length} Special Offer{biz.coupons.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* CTA */}
              <a
                href={`/business/${biz.business_id}`}
                className="card-link"
                itemProp="url"
                style={{ marginTop: '15px', display: 'block', textAlign: 'center' }}
              >
                View Details
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}