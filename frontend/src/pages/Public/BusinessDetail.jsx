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
import '../../styles/directory.css' // We can reuse the directory styles for consistency

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
      // Fetch everything in parallel
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

  // Safe Image URL helper
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
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Navigation */}
      <Link to="/directory" style={{ display:'inline-block', marginBottom:'1rem', textDecoration:'none', color:'#555' }}>
        ← Back to Directory
      </Link>

      {/* 1. Header Section */}
      <header style={{ marginBottom: '2rem', borderBottom:'1px solid #eee', paddingBottom:'1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{business.name}</h1>
        <div style={{ display:'flex', gap:'10px', alignItems:'center', color:'#666' }}>
          <span style={{ background:'#eee', padding:'4px 8px', borderRadius:'4px', fontSize:'0.9rem' }}>
            {business.business_type}
          </span>
          {business.address && <span>📍 {business.address}</span>}
        </div>
        <p style={{ marginTop: '1rem', fontSize: '1.1rem', lineHeight: '1.6', color:'#444' }}>
          {business.description}
        </p>
      </header>

      {/* 2. Media Gallery */}
      {media.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h3 style={{ borderBottom:'2px solid #333', display:'inline-block', marginBottom:'1rem' }}>Gallery</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {media.map(m => (
              <div key={m.asset_id} style={{ borderRadius:'8px', overflow:'hidden', boxShadow:'0 2px 5px rgba(0,0,0,0.1)' }}>
                {m.media_type === 'image' ? (
                  <img 
                    src={getImageUrl(m.url)} 
                    alt="Gallery" 
                    style={{ width:'100%', height:'150px', objectFit:'cover' }}
                    onError={(e) => e.target.style.display='none'}
                  />
                ) : (
                  <div style={{ height:'150px', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f0f0', color:'#888' }}>
                    {m.media_type}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* 3. Operational Info (Left Column) */}
        <div>
          <h3 style={{ borderBottom:'2px solid #333', display:'inline-block', marginBottom:'1rem' }}>Info</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {business.phone && <li style={{marginBottom:'0.5rem'}}>📞 <strong>Phone:</strong> {business.phone}</li>}
            {business.website && <li style={{marginBottom:'0.5rem'}}>🌐 <strong>Website:</strong> <a href={business.website} target="_blank" rel="noreferrer">{business.website}</a></li>}
            
            {hours && (
               <li style={{ marginTop:'1rem', background:'#f9f9f9', padding:'1rem', borderRadius:'8px' }}>
                 <strong>🕒 Opening Hours:</strong><br/>
                 <span style={{ fontSize:'1.2rem', color:'#333' }}>
                   {hours.opening_time} — {hours.closing_time}
                 </span>
               </li>
            )}
          </ul>
        </div>

        {/* 4. Services (Right Column) */}
        <div>
          <h3 style={{ borderBottom:'2px solid #333', display:'inline-block', marginBottom:'1rem' }}>Services</h3>
          {services.length === 0 ? <p className="muted">No specific services listed.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {services.map(s => (
                <li key={s.service_id} style={{ marginBottom: '1rem', borderBottom:'1px dashed #ddd', paddingBottom:'0.5rem' }}>
                  <div style={{ fontWeight: 'bold', fontSize:'1.1rem' }}>{s.name}</div>
                  <div style={{ color: '#666' }}>{s.description}</div>
                  <div style={{ marginTop:'4px', fontWeight:'bold', color:'#2c3e50' }}>{s.price}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 5. Coupons / Offers (Full Width) */}
      {coupons.length > 0 && (
        <section style={{ marginTop: '3rem', background:'#f0f9ff', padding:'2rem', borderRadius:'12px', border:'1px solid #b3e5fc' }}>
          <h2 style={{ marginTop:0, color:'#0277bd' }}>🎟 Exclusive Offers</h2>
          <div style={{ display: 'grid', gap: '1rem', marginTop:'1rem' }}>
            {coupons.map(c => (
              <div key={c.coupon_id} style={{ background:'white', padding:'1rem', borderRadius:'8px', boxShadow:'0 2px 4px rgba(0,0,0,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:'bold', fontSize:'1.1rem', color:'#d32f2f' }}>{c.code}</div>
                  <div>{c.description}</div>
                  <small style={{ color:'#888' }}>Expires: {c.valid_until.split('T')[0]}</small>
                </div>
                <div style={{ fontSize:'1.2rem', fontWeight:'bold', color:'#333' }}>
                  {c.discount_value}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}