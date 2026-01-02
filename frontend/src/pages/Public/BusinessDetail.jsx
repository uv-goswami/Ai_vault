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
import '../../styles/dashboard.css' // Keep dashboard styles for 'panel' class

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
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-primary, #333)' }}>
          {business.name}
        </h1>
        
        {/* Slogan (New) */}
        {business.quote_slogan && (
          <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '1rem' }}>
            "{business.quote_slogan}"
          </p>
        )}

        <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', alignItems:'center', color:'var(--text-secondary, #666)' }}>
          <span className="biz-type" style={{ background:'#eee', padding:'4px 8px', borderRadius:'4px', fontSize:'0.9rem' }}>
            {business.business_type}
          </span>
          {business.address && <span>📍 {business.address}</span>}
          {business.identification_mark && <span>🏷 {business.identification_mark}</span>}
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '1.05rem', lineHeight: '1.6', color:'var(--text-primary, #444)' }}>
          {business.description || "No description provided."}
        </p>
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
                    style={{ width:'100%', height:'180px', objectFit:'cover', display:'block' }}
                    onError={(e) => e.target.style.display='none'}
                  />
                ) : (
                  // Handle non-image media types gracefully
                  <div style={{ height:'180px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f9f9f9', color:'#555', padding:'1rem', textAlign:'center' }}>
                     <strong>{m.media_type.toUpperCase()}</strong>
                     <a href={getImageUrl(m.url)} target="_blank" rel="noreferrer" style={{marginTop:'5px', fontSize:'0.9rem'}}>Download / View</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* 3. Operational Info & Contact */}
        <div className="panel">
          <h3 style={{ borderBottom:'1px solid #eee', paddingBottom:'0.5rem', marginBottom:'1rem' }}>Contact & Info</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {business.phone ? (
               <li style={{marginBottom:'0.8rem'}}>📞 <a href={`tel:${business.phone}`}>{business.phone}</a></li>
            ) : <li style={{marginBottom:'0.8rem', color:'#aaa'}}>📞 No phone listed</li>}

            {business.website ? (
              <li style={{marginBottom:'0.8rem'}}>
                🌐 <a href={business.website} target="_blank" rel="noreferrer" style={{color:'var(--primary-color, #007bff)'}}>{business.website}</a>
              </li>
            ) : <li style={{marginBottom:'0.8rem', color:'#aaa'}}>🌐 No website listed</li>}
            
            {business.timezone && <li style={{marginBottom:'0.8rem', fontSize:'0.9rem', color:'#777'}}>🌍 {business.timezone}</li>}

            {hours ? (
               <li style={{ marginTop:'1.5rem', paddingTop:'1rem', borderTop:'1px dashed #eee' }}>
                 <strong>🕒 Business Hours:</strong>
                 <div style={{ fontSize:'1.1rem', marginTop:'0.5rem', fontWeight:'500' }}>
                   {/* Check both naming conventions just in case */}
                   {hours.opening_time || hours.opening_hours || 'N/A'} — {hours.closing_time || hours.closing_hours || 'N/A'}
                 </div>
               </li>
            ) : (
              <li style={{ marginTop:'1.5rem', color:'#888', fontStyle:'italic' }}>
                Operational hours not provided.
              </li>
            )}
          </ul>
        </div>

        {/* 4. Services */}
        <div className="panel">
          <h3 style={{ borderBottom:'1px solid #eee', paddingBottom:'0.5rem', marginBottom:'1rem' }}>Services</h3>
          {services.length === 0 ? <p className="muted">No services listed yet.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {services.map(s => (
                <li key={s.service_id} style={{ marginBottom: '1.2rem', borderBottom:'1px dashed #f0f0f0', paddingBottom:'0.8rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                    <div style={{ fontWeight: 'bold', fontSize:'1.05rem' }}>{s.name}</div>
                    {/* Ensure price shows if it exists */}
                    {s.price && <div style={{ fontWeight:'bold', color:'#2c3e50' }}>{s.price}</div>}
                  </div>
                  <div style={{ fontSize:'0.95rem', color:'#555', marginTop:'4px' }}>{s.description}</div>
                  {s.duration && <small style={{ color:'#888', display:'block', marginTop:'4px' }}>⏱ {s.duration} mins</small>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 5. Coupons / Offers */}
      {coupons.length > 0 && (
        <section style={{ marginTop: '2.5rem' }}>
          <h3 style={{ marginBottom:'1rem' }}>Active Offers & Coupons</h3>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {coupons.map(c => (
              <div key={c.coupon_id} className="panel" style={{ borderLeft: '5px solid #28a745', position:'relative' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start' }}>
                  <div>
                    <div style={{ fontWeight:'bold', fontSize:'1.2rem', color:'#28a745', letterSpacing:'1px' }}>{c.code}</div>
                    <div style={{ margin:'0.5rem 0', fontWeight:'500' }}>{c.description}</div>
                    
                    {/* Show terms if available */}
                    {c.terms_conditions && (
                      <p style={{ fontSize:'0.85rem', color:'#666', margin:'0.5rem 0' }}>
                        * {c.terms_conditions}
                      </p>
                    )}
                    
                    <small style={{ color:'#888', display:'block', marginTop:'5px' }}>
                      Valid until: {c.valid_until ? c.valid_until.split('T')[0] : 'Indefinite'}
                    </small>
                  </div>
                  
                  {/* Discount Badge */}
                  <div style={{ 
                    background:'#e6f4ea', color:'#1e7e34', 
                    padding:'5px 12px', borderRadius:'20px', 
                    fontWeight:'bold', fontSize:'0.9rem',
                    whiteSpace:'nowrap'
                  }}>
                    {c.discount_value} OFF
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