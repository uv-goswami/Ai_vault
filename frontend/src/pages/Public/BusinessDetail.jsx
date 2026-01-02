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
      // Fetch all data points in parallel
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

  // ✅ Helper: Format 24h time to AM/PM
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${suffix}`;
  }

  // ✅ Helper: Safe Image URL
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
    <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Navigation */}
      <Link to="/directory" className="ghost" style={{ display:'inline-block', marginBottom:'1.5rem', textDecoration:'none' }}>
        ← Back to Directory
      </Link>

      {/* 1. MAIN HEADER & IDENTITY */}
      <div className="panel" style={{ marginBottom: '2rem', borderLeft: '5px solid var(--primary-color, #007bff)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', alignItems:'flex-start' }}>
            <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#222' }}>
                {business.name}
                </h1>
                
                {/* Slogan */}
                {business.quote_slogan && (
                <p style={{ fontSize:'1.1rem', fontStyle: 'italic', color: '#555', marginBottom: '0.5rem' }}>
                    "{business.quote_slogan}"
                </p>
                )}

                <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', alignItems:'center', color:'#666', marginTop:'10px' }}>
                    <span className="biz-type" style={{ background:'#eef', color:'#3366cc', padding:'4px 10px', borderRadius:'4px', fontSize:'0.9rem', fontWeight:'bold' }}>
                        {business.business_type || "Business"}
                    </span>
                    
                    {/* Identification Mark */}
                    {business.identification_mark && (
                        <span style={{ background:'#f5f5f5', padding:'4px 8px', borderRadius:'4px', fontSize:'0.9rem' }}>
                            🏷 ID: {business.identification_mark}
                        </span>
                    )}

                    {/* Coordinates (Clickable) */}
                    {business.latitude && business.longitude && (
                        <a 
                           href={`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`} 
                           target="_blank" 
                           rel="noreferrer"
                           style={{ fontSize:'0.9rem', color:'#666', textDecoration:'none', display:'flex', alignItems:'center' }}
                        >
                           📍 {business.latitude}, {business.longitude} (View Map)
                        </a>
                    )}
                </div>
            </div>
        </div>

        <hr style={{ margin:'1.5rem 0', border:'none', borderTop:'1px solid #eee' }} />

        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color:'#444' }}>
          {business.description || "No description provided."}
        </p>

        <div style={{ marginTop:'1rem', color:'#555' }}>
            <strong>Address:</strong> {business.address || "No address listed"}
        </div>
      </div>

      {/* 2. MEDIA GALLERY */}
      {media.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom:'1rem' }}>Gallery</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {media.map(m => (
              <div key={m.asset_id} className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                {m.media_type === 'image' ? (
                  <img 
                    src={getImageUrl(m.url)} 
                    alt="Gallery" 
                    style={{ width:'100%', height:'180px', objectFit:'cover', display:'block', transition:'transform 0.3s' }}
                    onError={(e) => e.target.style.display='none'}
                  />
                ) : (
                  <div style={{ height:'180px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f9f9f9', color:'#555', padding:'1rem', textAlign:'center' }}>
                     <strong>{m.media_type.toUpperCase()}</strong>
                     <a href={getImageUrl(m.url)} target="_blank" rel="noreferrer" style={{marginTop:'5px', fontSize:'0.9rem'}}>View File</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* 3. OPERATIONAL INFO & AMENITIES */}
        <div className="panel">
          <h3 style={{ borderBottom:'1px solid #eee', paddingBottom:'0.5rem', marginBottom:'1rem' }}>Operational Details</h3>
          
          {/* Contact */}
          <ul style={{ listStyle: 'none', padding: 0, marginBottom:'1.5rem' }}>
            {business.phone ? (
               <li style={{marginBottom:'0.5rem'}}>📞 <strong>Phone:</strong> <a href={`tel:${business.phone}`}>{business.phone}</a></li>
            ) : <li style={{marginBottom:'0.5rem', color:'#aaa'}}>📞 Phone not listed</li>}

            {business.website ? (
              <li style={{marginBottom:'0.5rem'}}>
                🌐 <strong>Web:</strong> <a href={business.website} target="_blank" rel="noreferrer">{business.website}</a>
              </li>
            ) : <li style={{marginBottom:'0.5rem', color:'#aaa'}}>🌐 Website not listed</li>}
          </ul>

          {/* Operational Hours & Off Days */}
          {hours ? (
            <div style={{ background:'#f8f9fa', padding:'1rem', borderRadius:'8px', marginBottom:'1rem' }}>
               <div style={{ marginBottom:'0.5rem' }}>
                 <strong>🕒 Hours:</strong>{' '} 
                 {hours.opening_hours ? formatTime(hours.opening_hours) : 'N/A'} — {hours.closing_hours ? formatTime(hours.closing_hours) : 'N/A'}
               </div>
               
               {hours.off_days && hours.off_days.length > 0 && (
                   <div style={{ color:'#d32f2f' }}>
                       <strong>🚫 Closed On:</strong> {hours.off_days.join(', ')}
                   </div>
               )}
            </div>
          ) : (
            <p className="muted">Operational info not added.</p>
          )}

          {/* Amenities Badges */}
          {hours && (
             <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'1rem' }}>
                {/* WiFi */}
                {hours.wifi_available && (
                    <span style={{background:'#e6f4ea', color:'#1e7e34', padding:'5px 10px', borderRadius:'15px', fontSize:'0.85rem'}}>
                        📶 Free WiFi
                    </span>
                )}
                {/* Delivery */}
                {hours.delivery_options && (
                    <span style={{background:'#e3f2fd', color:'#1565c0', padding:'5px 10px', borderRadius:'15px', fontSize:'0.85rem'}}>
                        🚚 {hours.delivery_options}
                    </span>
                )}
                {/* Parking */}
                {hours.nearby_parking_spot && (
                    <span style={{background:'#fff3e0', color:'#e65100', padding:'5px 10px', borderRadius:'15px', fontSize:'0.85rem'}}>
                        🅿️ {hours.nearby_parking_spot}
                    </span>
                )}
                {/* Reservations */}
                {hours.reservation_options && (
                    <span style={{background:'#f3e5f5', color:'#7b1fa2', padding:'5px 10px', borderRadius:'15px', fontSize:'0.85rem'}}>
                        📅 {hours.reservation_options}
                    </span>
                )}
                {/* Accessibility */}
                {hours.accessibility_features && (
                    <span style={{background:'#f1f8e9', color:'#33691e', padding:'5px 10px', borderRadius:'15px', fontSize:'0.85rem'}}>
                        ♿ {hours.accessibility_features}
                    </span>
                )}
             </div>
          )}

          {/* Special Notes */}
          {hours?.special_notes && (
              <div style={{ marginTop:'1rem', fontSize:'0.9rem', color:'#666', fontStyle:'italic' }}>
                  ℹ️ Note: {hours.special_notes}
              </div>
          )}
        </div>

        {/* 4. SERVICES LIST */}
        <div className="panel">
          <h3 style={{ borderBottom:'1px solid #eee', paddingBottom:'0.5rem', marginBottom:'1rem' }}>Services Menu</h3>
          {services.length === 0 ? <p className="muted">No services listed yet.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {services.map(s => (
                <li key={s.service_id} style={{ marginBottom: '1rem', paddingBottom:'1rem', borderBottom:'1px solid #f0f0f0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ fontWeight: 'bold', fontSize:'1.1rem', color:'#333' }}>{s.name}</div>
                    
                    {/* ✅ Price with Symbol */}
                    {s.price && (
                        <div style={{ fontWeight:'bold', color:'#28a745', whiteSpace:'nowrap' }}>
                             ₹ {s.price}
                        </div>
                    )}
                  </div>
                  
                  <div style={{ fontSize:'0.95rem', color:'#666', marginTop:'4px' }}>{s.description}</div>
                  
                  {s.duration && (
                      <small style={{ color:'#888', display:'inline-block', marginTop:'6px', background:'#eee', padding:'2px 6px', borderRadius:'4px' }}>
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
        <section style={{ marginTop: '2.5rem' }}>
          <h3 style={{ marginBottom:'1rem' }}>Active Offers & Coupons</h3>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {coupons.map(c => (
              <div key={c.coupon_id} className="panel" style={{ borderLeft: '6px solid #ff9800', position:'relative' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start' }}>
                  <div>
                    <div style={{ fontWeight:'bold', fontSize:'1.3rem', color:'#e65100', fontFamily:'monospace', letterSpacing:'1px' }}>
                        {c.code}
                    </div>
                    <div style={{ margin:'0.5rem 0', fontWeight:'500', color:'#333' }}>{c.description}</div>
                    
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
                    background:'#fff3e0', color:'#ef6c00', 
                    padding:'6px 12px', borderRadius:'8px', 
                    fontWeight:'bold', fontSize:'1rem',
                    textAlign:'center', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
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