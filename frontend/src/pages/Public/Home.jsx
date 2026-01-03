import React from 'react'
import { Link } from 'react-router-dom'
import '../../styles/home.css'
// ✅ Import prefetch utility
import { prefetch } from '../../api/client'

export default function Home() {
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
            
            {/* 🚀 SYSTEM DESIGN: Prefetch Data on Hover */}
            {/* When user hovers here, we silently fetch the directory data. */}
            {/* When they click, the page loads instantly (0ms). */}
            <Link 
              to="/directory" 
              className="btn secondary"
              onMouseEnter={() => prefetch('/business/directory-view')}
            >
              Browse directory
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <main className="container">
        <section className="features">
          <div className="feature-card">
            <h3>Structured data, automatically</h3>
            <p>
              Generate JSON‑LD feeds from your profile, services, coupons, media, and operational info —
              optimized for search.
            </p>
          </div>
          <div className="feature-card">
            <h3>Visibility checks</h3>
            <p>
              Run quick audits for content completeness and get actionable recommendations to improve your score.
            </p>
          </div>
          <div className="feature-card">
            <h3>AI metadata</h3>
            <p>
              Extract entities, keywords, and intents from your content to inform SEO and customer discovery.
            </p>
          </div>
        </section>

        {/* Closing Section */}
        <section className="closing">
          <h3>Built for speed and clarity</h3>
          <p>
            Modular dashboards, clean components, and a public directory — everything you need to go from zero to visible.
          </p>
        </section>
      </main>
    </div>
  )
}