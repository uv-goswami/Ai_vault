import React, { useEffect, useState } from "react"
import {
  listBusinesses,
  getOperationalInfoByBusiness,
  listMedia,
  listServices,
  listCoupons,
  API_BASE // Imported to fix image URLs
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
      // 1. Fetch the list of businesses
      const businessList = await listBusinesses()

      // 2. Fetch details for ALL businesses in parallel (Efficient Data Loading)
      const enrichedData = await Promise.all(
        businessList.map(async (biz) => {
          try {
            // Run all 4 fetches at the same time for speed
            const [opInfo, media, services, coupons] = await Promise.all([
              getOperationalInfoByBusiness(biz.business_id).catch(() => null),
              listMedia(biz.business_id, 1, 0).catch(() => []), // Get 1 image for thumbnail
              listServices(biz.business_id, 100, 0).catch(() => []), // Get count
              listCoupons(biz.business_id, 100, 0).catch(() => [])  // Get count
            ])

            return {
              ...biz,
              hours: opInfo,
              media: media,
              services: services,
              coupons: coupons
            }
          } catch (e) {
            // If one fails, just return the basic info so the whole page doesn't crash
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

  // Helper to construct safe image URLs
  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }

  return (
    <div className="directory-page container">
      <h1 className="directory-title">AI-Ready Business Directory</h1>
      <p className="directory-sub">
        Smart listings optimized for AI systems, crawlers, and search engines.
      </p>

      {loading ? (
        <div className="muted">Loading directory data...</div>
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
              {/* Thumbnail - Now uses real data */}
              {biz.media && biz.media.length > 0 ? (
                <img
                  src={getImageUrl(biz.media[0].url)}
                  alt={biz.name}
                  className="directory-img"
                  onError={(e) => {
                    e.target.style.display = 'none' // Hide if broken
                    e.target.nextSibling.style.display = 'flex' // Show placeholder
                  }}
                />
              ) : null}
              {/* Fallback Placeholder (shown if no image or image breaks) */}
              <div 
                className="directory-img placeholder" 
                style={{ display: biz.media && biz.media.length > 0 ? 'none' : 'flex' }}
              >
                {biz.name.charAt(0)}
              </div>

              {/* Header */}
              <header className="card-header">
                <h2 itemProp="name">{biz.name}</h2>
                <span className="biz-type">
                  {biz.business_type || "LocalBusiness"}
                </span>
              </header>

              {/* Description */}
              <p className="card-description" itemProp="description">
                {biz.description 
                  ? (biz.description.length > 100 ? biz.description.substring(0, 100) + "..." : biz.description)
                  : "No description provided."}
              </p>

              {/* Details - Populated with Real Data */}
              <div className="card-meta">
                <p>
                  <strong>Address:</strong>{" "}
                  <span itemProp="address">{biz.address || "Location not listed"}</span>
                </p>

                {biz.hours ? (
                  <p>
                    <strong>Hours:</strong>{" "}
                    <span itemProp="openingHours">
                        {biz.hours.opening_time} - {biz.hours.closing_time}
                    </span>
                  </p>
                ) : (
                  <p>
                    <strong>Hours:</strong> <span className="muted-text">Contact for hours</span>
                  </p>
                )}

                <p>
                  <strong>Services:</strong> {biz.services.length > 0 ? `${biz.services.length} services listed` : "None listed"}
                </p>

                {biz.coupons.length > 0 ? (
                  <p className="coupon-highlight" style={{color: '#d32f2f', fontWeight: 'bold'}}>
                    🎟 {biz.coupons.length} Active Coupon{biz.coupons.length > 1 ? 's' : ''}!
                  </p>
                ) : (
                   <p className="muted-text" style={{fontSize: '0.9em', marginTop: '5px'}}>No active coupons</p>
                )}
              </div>

              {/* CTA */}
              <a
                href={`/business/${biz.business_id}`}
                className="card-link"
                itemProp="url"
              >
                View Details →
              </a>

              {/* AI Note */}
              <div className="structured-note">
                <small>✔ AI-Optimized Listing</small>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}