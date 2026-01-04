import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../styles/home.css'
import { prefetch, API_BASE } from '../../api/client'
import { prefetch, runExternalVisibilityCheck } from '../../api/client'

export default function Home() {
  // New State for Quick Audit
  const [auditUrl, setAuditUrl] = useState('')
  const [auditResult, setAuditResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAudit = async (e) => {
    e.preventDefault()
    if (!auditUrl) return
    
    setLoading(true)
    setAuditResult(null)
    setError(null)

    try {
      const data = await runExternalVisibilityCheck(auditUrl)
      if (data.error) throw new Error(data.error)
      setAuditResult(data)
    } catch (err) {
      setError(err.message || "Failed to audit site")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-inner">
          <h1>Elevate your local visibility with AiVault</h1>
          <p className="hero-sub">
            Build a rich business profile, generate Schema.org JSON‑LD, and turn your services and media
            into search‑ready experiences.
          </p>
          
          <div className="hero-actions">
            <Link to="/register" className="btn primary">Get started</Link>
            <Link 
              to="/directory" 
              className="btn secondary"
              onMouseEnter={() => prefetch('/business/directory-view')}
            >
              Browse directory
            </Link>
          </div>

          {/* --- NEW: Quick Audit Input --- */}
          <div style={{ marginTop: '2.5rem', maxWidth: '500px', marginLeft:'auto', marginRight:'auto' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>
              Already have a website? Check its AI Visibility score:
            </p>
            <form onSubmit={handleAudit} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="url" 
                placeholder="https://yourwebsite.com" 
                required
                value={auditUrl}
                onChange={(e) => setAuditUrl(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  borderRadius: '6px', 
                  border: '1px solid #ccc',
                  fontSize: '1rem'
                }}
              />
              <button 
                type="submit" 
                className="btn primary" 
                disabled={loading}
                style={{ padding: '0 20px' }}
              >
                {loading ? 'Scanning...' : 'Check'}
              </button>
            </form>

            {/* Error Message */}
            {error && (
               <div style={{ marginTop:'10px', color: '#ffcdd2', background: 'rgba(255,0,0,0.2)', padding:'10px', borderRadius:'4px' }}>
                 ⚠️ {error}
               </div>
            )}

            {/* Result Card (Ephemeral - No Database Storage) */}
            {auditResult && (
              <div className="panel" style={{ 
                  marginTop: '1.5rem', 
                  textAlign: 'left', 
                  background: 'white', 
                  color: '#333',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  animation: 'fadeIn 0.3s ease-out'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'1rem' }}>
                    <h3 style={{ margin:0 }}>Audit Results</h3>
                    <div style={{ 
                        background: auditResult.score >= 80 ? '#28a745' : auditResult.score >= 50 ? '#ffc107' : '#dc3545', 
                        color: 'white', 
                        padding: '5px 10px', 
                        borderRadius: '4px', 
                        fontWeight: 'bold' 
                    }}>
                        Score: {auditResult.score}/100
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                    <div>
                        <strong>🤖 For Bots:</strong>
                        <p>{auditResult.bot_analysis}</p>
                    </div>
                    <div>
                        <strong>👀 For Humans:</strong>
                        <p>{auditResult.human_analysis}</p>
                    </div>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                    <strong>💡 Recommendations:</strong>
                    <ul style={{ margin: '0.5rem 0 0 1.2rem', color: '#555', fontSize: '0.9rem' }}>
                        {auditResult.recommendations?.map((rec, i) => (
                            <li key={i}>{rec}</li>
                        ))}
                    </ul>
                </div>
                
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <Link to="/register" style={{ fontWeight: 'bold', color: '#007bff' }}>
                        Create a free AiVault profile to fix this →
                    </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Features Section (Unchanged) */}
      <main className="container">
        <section className="features">
          <div className="feature-card">
            <h3>Structured data, automatically</h3>
            <p>Generate JSON‑LD feeds from your profile, services, coupons, media, and operational info — optimized for search.</p>
          </div>
          <div className="feature-card">
            <h3>Visibility checks</h3>
            <p>Run quick audits for content completeness and get actionable recommendations to improve your score.</p>
          </div>
          <div className="feature-card">
            <h3>AI metadata</h3>
            <p>Extract entities, keywords, and intents from your content to inform SEO and customer discovery.</p>
          </div>
        </section>

        <section className="closing">
          <h3>Built for speed and clarity</h3>
          <p>Modular dashboards, clean components, and a public directory — everything you need to go from zero to visible.</p>
        </section>
      </main>
    </div>
  )
}