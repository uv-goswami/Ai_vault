import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../styles/home.css'
import { prefetch, runExternalVisibilityCheck } from '../../api/client'

export default function Home() {
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

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745'
    if (score >= 50) return '#ffc107'
    return '#dc3545'
  }

  return (
    <div className="home-page">
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

          <div style={{ marginTop: '2.5rem', maxWidth: '600px', marginLeft:'auto', marginRight:'auto' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>
              Check any website's AI Visibility Score:
            </p>
            <form onSubmit={handleAudit} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="url" 
                placeholder="https://example.com" 
                required
                value={auditUrl}
                onChange={(e) => setAuditUrl(e.target.value)}
                style={{ flex: 1, padding: '12px', borderRadius: '6px', border: 'none', color: '#333' }}
              />
              <button 
                type="submit" 
                className="btn primary" 
                disabled={loading}
                style={{ padding: '0 25px' }}
              >
                {loading ? 'Scanning...' : 'Check'}
              </button>
            </form>

            {error && (
               <div style={{ marginTop:'10px', color: '#ffcdd2', background: 'rgba(255,0,0,0.2)', padding:'10px', borderRadius:'4px' }}>
                 ⚠️ {error}
               </div>
            )}

            {auditResult && (
              <div className="panel" style={{ 
                  marginTop: '1.5rem', textAlign: 'left', background: 'white', color: '#333',
                  borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'1rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <h3 style={{ margin:0, color: '#333', fontSize: '1.2rem' }}>Audit Results</h3>
                    <div style={{ 
                        background: getScoreColor(auditResult.score), 
                        color: 'white', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem'
                    }}>
                        Score: {auditResult.score}/100
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.9rem' }}>
                    <div>
                        <strong style={{ color: '#000', display: 'block', marginBottom: '5px' }}>Bot Analysis</strong>
                        <p style={{ color: '#555', margin: 0, lineHeight: '1.5' }}>{auditResult.bot_analysis}</p>
                    </div>
                    <div>
                        <strong style={{ color: '#000', display: 'block', marginBottom: '5px' }}>Human Analysis</strong>
                        <p style={{ color: '#555', margin: 0, lineHeight: '1.5' }}>{auditResult.human_analysis}</p>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

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