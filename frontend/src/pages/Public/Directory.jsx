// src/pages/Public/Directory.jsx
import React, { useEffect, useState } from "react"
import {
  listBusinesses,
  getOperationalInfoByBusiness,
  listMedia,
  listServices,
  listCoupons
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
      const data = await listBusinesses()

      // Fetch extra info for each business
      const enriched = await Promise.all(
        data.map(async (b) => {
          const [hours, media, services, coupons] = await Promise.all([
            getOperationalInfoSafe(b.business_id),
            listMediaSafe(b.business_id),
            listServices(b.business_id, 100, 0).catch(() => []),
            listCoupons(b.business_id, 100, 0).catch(() => [])
          ])

          return {
            ...b,
            hours,
            media,
            services,
            coupons
          }
        })
      )

      setBusinesses(enriched)
    } catch (err) {
      console.error(err)
      setBusinesses([])
    } finally {
      setLoading(false)
    }
  }

  async function getOperationalInfoSafe(businessId) {
    try {
      return await getOperationalInfoByBusiness(businessId)
    } catch {
      return null
    }
  }

  async function listMediaSafe(businessId) {
    try {
      return await listMedia(businessId, 5, 0)
    } catch {
      return []
    }
  }

  return (
    <div className="directory-page container">
      <h1 className="directory-title">AI-Ready Business Directory</h1>
      <p className="directory-sub">
        Smart listings optimized for AI systems, crawlers, and search engines.
      </p>

      {loading ? (
        <div className="muted">Loading...</div>
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
              {/* Thumbnail */}
              {biz.media.length > 0 ? (
                <img
                  src={biz.media[0].url}
                  alt={biz.name}
                  className="directory-img"
                />
              ) : (
                <div className="directory-img placeholder">No Image</div>
              )}

              {/* Header */}
              <header className="card-header">
                <h2 itemProp="name">{biz.name}</h2>
                <span className="biz-type">
                  {biz.business_type || "LocalBusiness"}
                </span>
              </header>

              {/* Description */}
              <p className="card-description" itemProp="description">
                {biz.description || "No description available."}
              </p>

              {/* Details */}
              <div className="card-meta">
                <p>
                  <strong>Address:</strong>{" "}
                  <span itemProp="address">{biz.address || "—"}</span>
                </p>

                {biz.hours ? (
                  <p>
                    <strong>Hours:</strong>{" "}
                    {biz.hours.opening_hours} → {biz.hours.closing_hours}
                  </p>
                ) : (
                  <p>
                    <strong>Hours:</strong> Not provided
                  </p>
                )}

                <p>
                  <strong>Services:</strong> {biz.services.length}
                </p>

                {biz.coupons.length > 0 && (
                  <p className="coupon-highlight">
                    {biz.coupons.length} active coupon(s) available!
                  </p>
                )}
              </div>

              {/* CTA */}
              <a
                href={`/business/${biz.business_id}`}
                className="card-link"
                itemProp="url"
              >
                View Business →
              </a>

              {/* AI Note */}
              <div className="structured-note">
                <small>✔ AI-Optimized Structured Listing</small>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
