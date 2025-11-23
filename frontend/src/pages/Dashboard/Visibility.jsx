import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
import '../../styles/dashboard.css'   // ✅ make sure this is imported

export default function Visibility() {
  const { id } = useParams()
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    loadResults()
    loadSuggestions()
  }, [id])

  async function runCheck() {
    try {
      const res = await fetch(`http://localhost:8000/visibility/run?business_id=${id}`, {
        method: 'POST'
      })
      const data = await res.json()
      setResults(prev => [data, ...prev])
    } catch (err) {
      console.error(err)
    }
  }

  async function loadResults() {
    try {
      const res = await fetch(`http://localhost:8000/visibility/result?business_id=${id}&limit=20&offset=0`)
      const data = await res.json()
      setResults(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadSuggestions() {
    try {
      const res = await fetch(`http://localhost:8000/visibility/suggestion?business_id=${id}&limit=20&offset=0`)
      const data = await res.json()
      setSuggestions(data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <SidebarNav />
      </div>
      <div className="dashboard-content">
        <h2 className="page-title">Visibility</h2>
        <button onClick={runCheck}>Run Visibility Check</button>

        <h3>Results</h3>
        {results.length === 0 ? (
          <p>No visibility checks yet.</p>
        ) : (
          results.map(r => (
            <div key={r.result_id} className="panel">
              <p><strong>Score:</strong> {r.visibility_score}</p>
              <p><strong>Issues:</strong> {r.issues_found || 'None'}</p>
              <p><strong>Recommendations:</strong> {r.recommendations || 'None'}</p>
              <p><strong>Completed:</strong> {r.completed_at}</p>
            </div>
          ))
        )}

        <h3>Suggestions</h3>
        {suggestions.length === 0 ? (
          <p>No suggestions available.</p>
        ) : (
          suggestions.map(s => (
            <div key={s.suggestion_id} className="panel">
              <p><strong>Type:</strong> {s.suggestion_type}</p>
              <p><strong>Title:</strong> {s.title}</p>
              <p><strong>Status:</strong> {s.status}</p>
              <p><strong>Suggested At:</strong> {s.suggested_at}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
