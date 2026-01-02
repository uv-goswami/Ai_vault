import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getBusiness,
  getOperationalInfoByBusiness,
  listMedia,
  listServices,
  listCoupons,
  API_BASE
} from '../../api/client'
import '../../styles/directory.css'
import '../../styles/dashboard.css' // ✅ Import dashboard styles to use 'panel' class

export default function BusinessDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadFullProfile()
  }, [id])

  async function loadFullProfile() {
    setLoading(true)
    try {
      const [biz, opInfo, media, services, coupons] = await Promise.all([
        getBusiness(id),
        getOperationalInfoByBusiness(id).catch(() => null),
        listMedia(id, 100, 0).catch(() => []),
        listServices(id, 100, 0).catch(() => []),
        listCoupons(id, 100, 0).catch(() => [])
      ])

      setData({
        business: biz,
        hours: opInfo,
        media: media,
        services: services,
        coupons: coupons
      })
    } catch (err) {
      console.error(err)
      setError("Could not load business details.")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Helper: Robust Time Formatter (Fixes "undefined" issue)
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    const hour = parseInt(parts[0], 10);
    const minute = parts[1] || '00'; 
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute} ${suffix}`;
  }

  const getImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }

  if (loading) return <div className="container" style={{padding:'2rem'}}>Loading details...</div>
  if (error) return <div className="container" style={{padding:'2rem', color:'red'}}>{error}</div>
  if (!data) return null

  const { business, hours, media, services, coupons } = data

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Navigation */}
      <Link to="/directory" className="ghost" style={{ display:'inline-block', marginBottom:'1.5rem', textDecoration:'none' }}>
        ← Back to Directory
      </Link>

      {/* 1. Header Section */}
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary, #333)' }}>
          {business.name}
        </h1>
        
        {/* ✅ Slogan Added Here */}
        {business.quote_slogan && (
          <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '0.8rem', fontSize: '0.95rem' }}>
            "{business.quote_slogan}"
          </p>
        )}

        <div style={{ display:'flex', flexWrap: 'wrap', gap:'15px', alignItems:'center', color:'var(--text-secondary, #666)' }}>
          <span className="biz-type" style={{ fontSize:'0.9rem', fontWeight: 'bold' }}>
            {business.business_type}
          </span>
          {business.address && <span>📍 {business.address}</span>}
          
          {/* ✅ Lat/Long Added Here */}
          {business.latitude && business.longitude && (
             <a 
                href={`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ fontSize:'0.9rem', color: '#555', textDecoration:'underline' }}
             >
                🗺️ View Map
             </a>
          )}
        </div>

        <p style={{ marginTop: '1rem', fontSize: '1.05rem', lineHeight: '1.6', color:'var(--text-primary, #444)' }}>
          {business.description}
        </p>

        {/* ✅ Identification Mark */}
        {business.identification_mark && (
            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#888' }}>
                ID Mark: {business.identification_mark}
            </div>
        )}
      </div>

      {/* 2. Media Gallery */}
      {media.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom:'1rem' }}>Gallery</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {media.map(m => (
              <div key={m.asset_id} className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                {m.media_type === 'image' ? (
                  <img 
                    src={getImageUrl(m.url)} 
                    alt="Gallery" 
                    style={{ width:'100%', height:'160px', objectFit:'cover', display:'block' }}
                    onError={(e) => e.target.style.display='none'}
                  />
                ) : (
                  <div style={{ height:'160px', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f5', color:'#888' }}>
                    {m.media_type}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* 3. Operational Info */}
        <div className="panel">
          <h3 style={{ borderBottom:'1px solid #eee', paddingBottom:'0.5rem', marginBottom:'1rem' }}>Contact & Hours</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {business.phone && <li style={{marginBottom:'0.8rem'}}>📞 {business.phone}</li>}
            {business.website && (
              <li style={{marginBottom:'0.8rem'}}>
                🌐 <a href={business.website} target="_blank" rel="noreferrer" style={{color:'var(--primary-color, #007bff)'}}>{business.website}</a>
              </li>
            )}
            
            {hours ? (
               <li style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px dashed #eee' }}>
                 <strong>🕒 Open Hours:</strong>
                 {/* ✅ Fixed Time Formatting */}
                 <div style={{ fontSize:'1.1rem', marginTop:'0.2rem' }}>
                   {hours.opening_hours ? formatTime(hours.opening_hours) : 'N/A'} — {hours.closing_hours ? formatTime(hours.closing_hours) : 'N/A'}
                 </div>
                 
                 {/* ✅ Off Days */}
                 {hours.off_days && hours.off_days.length > 0 && (
                     <div style={{ marginTop: '5px', color: '#d32f2f', fontSize: '0.9rem' }}>
                         Closed: {hours.off_days.join(', ')}
                     </div>
                 )}

                 {/* ✅ Amenities Badges (Subtle Style) */}
                 <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'10px' }}>
                    {hours.wifi_available && <span style={badgeStyle}>📶 WiFi</span>}
                    {hours.delivery_options && <span style={badgeStyle}>🚚 {hours.delivery_options}</span>}
                    {hours.nearby_parking_spot && <span style={badgeStyle}>🅿️ {hours.nearby_parking_spot}</span>}
                    {hours.accessibility_features && <span style={badgeStyle}>♿ {hours.accessibility_features}</span>}
                 </div>
               </li>
            ) : (
              <li style={{ marginTop:'1rem', color:'#888' }}>Hours not listed.</li>
            )}
          </ul>
        </div>

        {/* 4. Services */}
        <div className="panel">
          <h3 style={{ borderBottom:'1px solid #eee', paddingBottom:'0.5rem', marginBottom:'1rem' }}>Services</h3>
          {services.length === 0 ? <p className="muted">No specific services listed.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {services.map(s => (
                <li key={s.service_id} style={{ marginBottom: '1rem', borderBottom:'1px dashed #f0f0f0', paddingBottom:'0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 'bold' }}>{s.name}</div>
                    {/* ✅ Price Symbol Added */}
                    {s.price && <div style={{ fontWeight:'bold', color:'var(--primary-color, #2c3e50)' }}>₹{s.price}</div>}
                  </div>
                  <div style={{ fontSize:'0.9rem', color:'#666', margin:'2px 0' }}>{s.description}</div>
                  {s.duration && <small style={{ color: '#888' }}>⏱ {s.duration} mins</small>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 5. Coupons / Offers */}
      {coupons.length > 0 && (
        <section style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom:'1rem' }}>Exclusive Offers</h3>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {coupons.map(c => (
              <div key={c.coupon_id} className="panel" style={{ borderLeft: '4px solid #28a745' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start' }}>
                  <div>
                    <div style={{ fontWeight:'bold', fontSize:'1.1rem', color:'#28a745' }}>{c.code}</div>
                    <div style={{ margin:'0.5rem 0' }}>{c.description}</div>
                    <small style={{ color:'#888' }}>Expires: {c.valid_until ? c.valid_until.split('T')[0] : 'N/A'}</small>
                  </div>
                  <div style={{ background:'#e6f4ea', color:'#1e7e34', padding:'5px 10px', borderRadius:'4px', fontWeight:'bold' }}>
                    {c.discount_value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}

// Simple internal style for badges to keep it clean
const badgeStyle = {
    background: '#f1f1f1',
    color: '#555',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    border: '1px solid #ddd'
}