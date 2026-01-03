import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
import '../../styles/dashboard.css'
import { API_BASE } from '../../api/client'

export default function Visibility() {
  const { id } = useParams()
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  
  // NEW: Loading state for better UX
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
      // Add new result to top of list
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

  // Helper to color-code the score
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
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
           <h2 className="page-title">AI Visibility Audit</h2>
           <button onClick={runCheck} disabled={running} style={{ minWidth:'140px' }}>
             {running ? 'Analyzing...' : 'Run AI Audit'}
           </button>
        </div>

        <p className="muted">
            This tool analyzes how your business appears to <strong>AI Agents (Bots)</strong> and <strong>Humans</strong>.
        </p>

        <h3>Audit History</h3>
        {results.length === 0 ? (
          <p>No visibility checks run yet.</p>
        ) : (
          results.map(r => (
            <div key={r.result_id} className="panel" style={{ borderLeft: `5px solid ${getScoreColor(r.visibility_score)}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                  <div style={{ fontSize:'1.5rem', fontWeight:'bold', color: getScoreColor(r.visibility_score) }}>
                      {r.visibility_score} / 100
                  </div>
                  <div className="muted">{new Date(r.completed_at).toLocaleString()}</div>
              </div>

              {/* Issues Section */}
              <div style={{ marginBottom: '10px' }}>
                 <strong>⚠️ Issues Detected:</strong>
                 <p style={{ color: '#d32f2f', background:'#ffebee', padding:'10px', borderRadius:'4px', marginTop:'5px' }}>
                    {r.issues_found || 'None'}
                 </p>
              </div>

              {/* Recommendations Section */}
              <div>
                 <strong>🤖 AI & Human Analysis:</strong>
                 <div style={{ marginTop:'5px', lineHeight:'1.6' }}>
                    {/* We split the recommendations string if it contains our special separator "||" */}
                    {r.recommendations && r.recommendations.includes('||') 
                        ? r.recommendations.split('||').map((part, idx) => (
                            <div key={idx} style={{ marginBottom:'4px' }}>{part.trim()}</div>
                          ))
                        : (r.recommendations || 'None')
                    }
                 </div>
              </div>
            </div>
          ))
        )}

        {/* Suggestions Section (Optional Manual Suggestions) */}
        {suggestions.length > 0 && (
            <>
                <h3>Manual Suggestions</h3>
                {suggestions.map(s => (
                    <div key={s.suggestion_id} className="panel">
                    <p><strong>Type:</strong> {s.suggestion_type}</p>
                    <p><strong>Title:</strong> {s.title}</p>
                    <p><strong>Status:</strong> {s.status}</p>
                    </div>
                ))}
            </>
        )}
      </div>
    </div>
  )
}