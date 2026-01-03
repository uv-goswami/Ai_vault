import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
import '../../styles/dashboard.css'
import { API_BASE } from '../../api/client'

export default function Visibility() {
  const { id } = useParams()
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [running, setRunning] = useState(false)

  useEffect(() => {
    loadResults()
    loadSuggestions()
  }, [id])

  async function runCheck() {
    setRunning(true)
    try {
      const res = await fetch(`${API_BASE}/visibility/run?business_id=${id}`, {
        method: 'POST'
      })
      const data = await res.json()
      setResults(prev => [data, ...prev])
    } catch (err) {
      console.error(err)
    } finally {
      setRunning(false)
    }
  }

  async function loadResults() {
    try {
      const res = await fetch(`${API_BASE}/visibility/result?business_id=${id}&limit=20&offset=0`)
      const data = await res.json()
      setResults(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadSuggestions() {
    try {
      const res = await fetch(`${API_BASE}/visibility/suggestion?business_id=${id}&limit=20&offset=0`)
      const data = await res.json()
      setSuggestions(data)
    } catch (err) {
      console.error(err)
    }
  }

  // Helper: Parse the "recommendations" string into 3 distinct sections
  const parseAnalysis = (text) => {
    if (!text) return { bots: null, humans: null, actions: null }
    
    // Default fallback
    let bots = "No specific data"
    let humans = "No specific data"
    let actions = text

    // Try splitting by the separators we set in backend
    const parts = text.split('||')
    
    parts.forEach(part => {
        part = part.trim()
        if (part.startsWith('[BOTS]:')) bots = part.replace('[BOTS]:', '').trim()
        else if (part.startsWith('[HUMANS]:')) humans = part.replace('[HUMANS]:', '').trim()
        else if (part.startsWith('ACTIONS:')) actions = part.replace('ACTIONS:', '').trim()
    })

    return { bots, humans, actions }
  }

  // Helper: Split semicolon separated lists (issues/actions)
  const formatList = (str) => {
    if (!str) return []
    return str.split(';').map(item => item.trim()).filter(item => item.length > 0)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745' // Green
    if (score >= 50) return '#ffc107' // Yellow
    return '#dc3545' // Red
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <SidebarNav />
      </div>
      <div className="dashboard-content">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
           <div>
             <h2 className="page-title" style={{ margin: 0 }}>Visibility Audit</h2>
             <p className="muted" style={{ margin: '0.5rem 0 0' }}>
                Analyze how your business appears to AI Agents and Humans.
             </p>
           </div>
           <button onClick={runCheck} disabled={running} style={{ minWidth: '160px' }}>
             {running ? 'Running Analysis...' : 'Run New Audit'}
           </button>
        </div>

        {/* Audit History Loop */}
        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Latest Audits</h3>
        
        {results.length === 0 ? (
          <div className="panel muted" style={{ textAlign: 'center', padding: '3rem' }}>
            No visibility checks run yet. Click the button above to start.
          </div>
        ) : (
          results.map(r => {
            const { bots, humans, actions } = parseAnalysis(r.recommendations)
            const issuesList = formatList(r.issues_found)
            const actionsList = formatList(actions)
            const scoreColor = getScoreColor(r.visibility_score)

            return (
              <div key={r.result_id} className="panel" style={{ marginBottom: '2rem' }}>
                
                {/* 1. Score Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ 
                            background: scoreColor, 
                            color: '#fff', 
                            borderRadius: '8px', 
                            padding: '10px 15px', 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold',
                            minWidth: '80px',
                            textAlign: 'center'
                        }}>
                            {r.visibility_score}
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Visibility Score</div>
                            <div className="muted" style={{ fontSize: '0.85rem' }}>
                                {new Date(r.completed_at).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Critical Issues (Only show if issues exist) */}
                {issuesList.length > 0 && (
                    <div style={{ marginBottom: '1.5rem', background: '#fff5f5', border: '1px solid #ffcdd2', borderRadius: '6px', padding: '1rem' }}>
                        <h4 style={{ color: '#c62828', marginTop: 0, marginBottom: '0.5rem' }}>Critical Issues Detected</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#b71c1c' }}>
                            {issuesList.map((issue, idx) => (
                                <li key={idx} style={{ marginBottom: '4px' }}>{issue}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 3. Analysis Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <h4 style={{ marginTop: 0, color: '#444', borderBottom: '2px solid #ddd', display: 'inline-block', paddingBottom: '3px' }}>
                            Bot Perspective
                        </h4>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#555' }}>
                            {bots}
                        </p>
                    </div>
                    <div>
                        <h4 style={{ marginTop: 0, color: '#444', borderBottom: '2px solid #ddd', display: 'inline-block', paddingBottom: '3px' }}>
                            Human Perspective
                        </h4>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#555' }}>
                            {humans}
                        </p>
                    </div>
                </div>

                {/* 4. Action Plan */}
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '0.8rem', color: '#2c3e50' }}>Recommended Actions</h4>
                    {actionsList.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                            {actionsList.map((action, idx) => (
                                <li key={idx} style={{ marginBottom: '6px', color: '#444' }}>{action}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="muted">No specific actions required.</p>
                    )}
                </div>

              </div>
            )
          })
        )}
      </div>
    </div>
  )
}