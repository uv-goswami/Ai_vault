import React, { useEffect, useState } from "react"
import {
  listBusinesses,
  getOperationalInfoByBusiness,
  listMedia,
  listServices,
  listCoupons,
  API_BASE
} from "../../api/client"
import "../../styles/directory.css"

export default function Directory() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDirectory()
  }, [])

  async function loadDirectory() {
    setLoading(true)
    try {
      const businessList = await listBusinesses()

      const enrichedData = await Promise.all(
        businessList.map(async (biz) => {
          try {
            const [opInfo, media, services, coupons] = await Promise.all([
              getOperationalInfoByBusiness(biz.business_id).catch(() => null),
              listMedia(biz.business_id, 1, 0).catch(() => []),
              listServices(biz.business_id, 100, 0).catch(() => []), 
              listCoupons(biz.business_id, 100, 0).catch(() => [])
            ])

            return { ...biz, hours: opInfo, media, services, coupons }
          } catch (e) {
            return { ...biz, hours: null, media: [], services: [], coupons: [] }
          }
        })
      )
      setBusinesses(enrichedData)
    } catch (err) {
      console.error("Failed to load directory:", err)
      setBusinesses([])
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
            >
              {/* Image Section - Logic Updated */}
              {biz.media && biz.media.length > 0 ? (
                <img
                  src={getImageUrl(biz.media[0].url)}
                  alt={biz.name}
                  className="directory-img"
                  style={{ objectFit: 'cover', width: '100%', height: '180px' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    // Find the sibling placeholder and show it
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              
              {/* ✅ NEW: Professional Neutral Placeholder (Building Icon) */}
              <div 
                className="directory-img placeholder" 
                style={{ 
                  display: biz.media && biz.media.length > 0 ? 'none' : 'flex',
                  backgroundColor: '#f8f9fa', // Very light grey
                  color: '#b0b3b8',           // Muted icon color
                  height: '180px',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid #eee'
                }}
              >
                {/* Simple SVG Building Icon */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4 8 4v14" />
                  <path d="M9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                </svg>
              </div>

              {/* Header */}
              <header className="card-header">
                <h2 itemProp="name">{biz.name}</h2>
                <span className="biz-type">
                  {biz.business_type || "Business"}
                </span>
              </header>

              {/* Description (Only show if exists) */}
              {biz.description && (
                <p className="card-description" itemProp="description">
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

                {/* Only show services count if > 0 */}
                {biz.services.length > 0 && (
                  <p>
                    <strong>🛠 Services:</strong> {biz.services.length} available
                  </p>
                )}

                {/* Positive Green Badge for Coupons */}
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