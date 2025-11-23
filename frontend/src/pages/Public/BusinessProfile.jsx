import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getBusiness, listServices, listMedia } from '../../api/client'
import JsonBlock from '../../components/JsonBlock'
import '../../styles/businessprofile.css'

export default function BusinessProfile() {
  const { businessId } = useParams()
  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [media, setMedia] = useState([])

  useEffect(() => {
    if (!businessId) return
    getBusiness(businessId).then(setBusiness).catch(() => {})
    listServices(businessId).then(setServices).catch(() => {})
    listMedia(businessId).then(setMedia).catch(() => {})
  }, [businessId])

  return (
    <div className="business-page container">
      {business ? (
        <>
          <h1>{business.name}</h1>
          <div className="muted">{business.business_type || 'LocalBusiness'}</div>
          <p>{business.description}</p>

          {/* Contact & Location */}
          <div className="panel">
            <h3>Contact & Location</h3>
            <div className="small">Phone: {business.phone || '—'}</div>
            <div className="small">Website: {business.website || '—'}</div>
            <div className="small">Address: {business.address || '—'}</div>
            <div className="small">
              Coords: {business.latitude ?? '—'}, {business.longitude ?? '—'}
            </div>
          </div>

          {/* Services */}
          <div className="panel">
            <h3>Services</h3>
            {services.length === 0 && <div className="muted">No services listed.</div>}
            <div className="grid">
              {services.map(s => (
                <div key={s.service_id} className="panel">
                  <strong>{s.name}</strong>
                  <div className="muted small">{s.service_type}</div>
                  <div className="small">{s.description}</div>
                  <div className="small">₹{s.price}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Media Gallery */}
          <div className="panel">
            <h3>Gallery</h3>
            {media.length === 0 && <div className="muted">No media uploaded.</div>}
            <div className="grid">
              {media.map(m => (
                <div key={m.asset_id} className="panel">
                  <div className="muted small">{m.media_type}</div>
                  <div className="small">{m.url}</div>
                  {m.alt_text && <div className="small">{m.alt_text}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* JSON-LD Preview */}
          <JsonBlock title="Generated JSON-LD" data={business} />
        </>
      ) : (
        <div className="muted">Loading...</div>
      )}
    </div>
  )
}
