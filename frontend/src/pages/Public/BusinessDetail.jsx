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
import '../../styles/dashboard.css'

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

  // ✅ FIXED: Robust Time Formatter
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // Handle "10:30:00", "10:30", or just "10"
    const parts = timeStr.split(':');
    const hour = parseInt(parts[0], 10);
    const minute = parts[1] || '00'; // Default to 00 if undefined

    const suffix = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute} ${suffix}`;
  }

  const getImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }

  if (loading) return <div className="dashboard-page"><div className="dashboard-content"><p>Loading details...</p></div></div>
  if (error) return <div className="dashboard-page"><div className="dashboard-content"><p style={{color:'red'}}>{error}</p></div></div>
  if (!data) return null

  const { business, hours, media, services, coupons } = data

  return (
    <div className="dashboard-page" style={{ display: 'block', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="dashboard-content" style={{ padding: '20px' }}>
        
        {/* Navigation */}
        <Link to="/directory" className="ghost" style={{ display:'inline-block', marginBottom:'1.5rem', textDecoration:'none' }}>
          ← Back to Directory
        </Link>

        {/* 1. MAIN HEADER & IDENTITY */}
        <div className="panel">
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', alignItems:'flex-start' }}>
              <div>
                  <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>
                    {business.name}
                  </h1>
                  
                  {business.quote_slogan && (
                    <p style={{ fontStyle: 'italic', opacity: 0.8, marginBottom: '0.5rem' }}>
                        "{business.quote_slogan}"
                    </p>
                  )}

                  <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', alignItems:'center', marginTop:'10px', opacity: 0.9 }}>
                      <span className="biz-type" style={{ fontWeight:'bold' }}>
                          {business.business_type || "Business"}
                      </span>
                      
                      {business.identification_mark && (
                          <span>
                              | ID: {business.identification_mark}
                          </span>
                      )}

                      {business.latitude && business.longitude && (
                          <a 
                             href={`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`} 
                             target="_blank" 
                             rel="noreferrer"
                             style={{ textDecoration:'underline', color: 'inherit' }}
                          >
                             📍 View Map
                          </a>
                      )}
                  </div>
              </div>
          </div>

          <hr style={{ margin:'1.5rem 0', opacity: 0.2 }} />

          <p style={{ lineHeight: '1.6' }}>
            {business.description || "No description provided."}
          </p>

          <div style={{ marginTop:'1rem', opacity: 0.9 }}>
              <strong>Address:</strong> {business.address || "No address listed"}
          </div>
        </div>

        {/* 2. MEDIA GALLERY */}
        {media.length > 0 && (
          <div className="collapsible-section" style={{ marginTop: '2rem' }}>
            <h3 className="form-title">Gallery</h3>
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
                    <div style={{ height:'180px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', opacity: 0.7, padding:'1rem', textAlign:'center' }}>
                       <strong>{m.media_type.toUpperCase()}</strong>
                       <a href={getImageUrl(m.url)} target="_blank" rel="noreferrer" style={{marginTop:'5px', fontSize:'0.9rem'}}>View File</a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          
          {/* 3. OPERATIONAL INFO */}
          <div className="panel">
            <h3 style={{ borderBottom:'1px solid rgba(0,0,0,0.1)', paddingBottom:'0.5rem', marginBottom:'1rem' }}>Operational Details</h3>
            
            <ul style={{ listStyle: 'none', padding: 0, marginBottom:'1.5rem' }}>
              {business.phone ? (
                 <li style={{marginBottom:'0.5rem'}}>📞 <a href={`tel:${business.phone}`}>{business.phone}</a></li>
              ) : <li style={{marginBottom:'0.5rem', opacity: 0.6}}>📞 Phone not listed</li>}

              {business.website ? (
                <li style={{marginBottom:'0.5rem'}}>
                  🌐 <a href={business.website} target="_blank" rel="noreferrer">{business.website}</a>
                </li>
              ) : <li style={{marginBottom:'0.5rem', opacity: 0.6}}>🌐 Website not listed</li>}
            </ul>

            {hours ? (
              <div style={{ padding:'1rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius:'8px', marginBottom:'1rem' }}>
                 <div style={{ marginBottom:'0.5rem' }}>
                   <strong>🕒 Hours:</strong>{' '} 
                   {hours.opening_hours ? formatTime(hours.opening_hours) : 'N/A'} — {hours.closing_hours ? formatTime(hours.closing_hours) : 'N/A'}
                 </div>
                 
                 {hours.off_days && hours.off_days.length > 0 && (
                     <div>
                         <strong>🚫 Closed On:</strong> {hours.off_days.join(', ')}
                     </div>
                 )}
              </div>
            ) : (
              <p style={{ opacity: 0.6 }}>Operational info not added.</p>
            )}

            {hours && (
               <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'1rem' }}>
                  {hours.wifi_available && <span>📶 Free WiFi</span>}
                  {hours.delivery_options && <span>🚚 {hours.delivery_options}</span>}
                  {hours.nearby_parking_spot && <span>🅿️ {hours.nearby_parking_spot}</span>}
                  {hours.reservation_options && <span>📅 {hours.reservation_options}</span>}
                  {hours.accessibility_features && <span>♿ {hours.accessibility_features}</span>}
               </div>
            )}

            {hours?.special_notes && (
                <div style={{ marginTop:'1rem', fontSize:'0.9rem', fontStyle:'italic', opacity: 0.8 }}>
                    ℹ️ Note: {hours.special_notes}
                </div>
            )}
          </div>

          {/* 4. SERVICES LIST */}
          <div className="panel">
            <h3 style={{ borderBottom:'1px solid rgba(0,0,0,0.1)', paddingBottom:'0.5rem', marginBottom:'1rem' }}>Services</h3>
            {services.length === 0 ? <p style={{ opacity: 0.6 }}>No services listed yet.</p> : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {services.map(s => (
                  <li key={s.service_id} style={{ marginBottom: '1rem', paddingBottom:'1rem', borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ fontWeight: 'bold', fontSize:'1.1rem' }}>{s.name}</div>
                      
                      {s.price && (
                          <div style={{ fontWeight:'bold' }}>
                               ₹ {s.price}
                          </div>
                      )}
                    </div>
                    
                    <div style={{ fontSize:'0.95rem', marginTop:'4px', opacity: 0.8 }}>{s.description}</div>
                    
                    {s.duration && (
                        <small style={{ display:'inline-block', marginTop:'6px', opacity: 0.7 }}>
                            ⏱ {s.duration} mins
                        </small>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 5. COUPONS & OFFERS */}
        {coupons.length > 0 && (
          <div className="collapsible-section" style={{ marginTop: '2rem' }}>
            <h3 className="form-title">Active Offers</h3>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {coupons.map(c => (
                <div key={c.coupon_id} className="panel">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start' }}>
                    <div>
                      <div style={{ fontWeight:'bold', fontSize:'1.2rem', letterSpacing:'1px' }}>
                          {c.code}
                      </div>
                      <div style={{ margin:'0.5rem 0', fontWeight:'500' }}>{c.description}</div>
                      
                      {c.terms_conditions && (
                        <p style={{ fontSize:'0.85rem', margin:'0.5rem 0', opacity: 0.7 }}>
                          * {c.terms_conditions}
                        </p>
                      )}
                      
                      <small style={{ opacity: 0.6, display:'block', marginTop:'5px' }}>
                        Valid until: {c.valid_until ? c.valid_until.split('T')[0] : 'Indefinite'}
                      </small>
                    </div>
                    
                    {/* Discount Badge - Neutral Style */}
                    <div style={{ 
                      border: '1px solid rgba(0,0,0,0.2)', 
                      padding:'6px 12px', borderRadius:'8px', 
                      fontWeight:'bold', fontSize:'1rem',
                      textAlign:'center'
                    }}>
                      {c.discount_value} OFF
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}