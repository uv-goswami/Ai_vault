import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
import '../../styles/dashboard.css'   // ✅ make sure this is imported

export default function JsonLD() {
  const { id } = useParams()
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeeds()
  }, [id])

  async function loadFeeds() {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8000/jsonld?business_id=${id}`)
      if (res.ok) {
        const data = await res.json()
        setFeeds(Array.isArray(data) ? data : [])
      } else {
        setFeeds([])
      }
    } catch (err) {
      console.error(err)
      setFeeds([])
    } finally {
      setLoading(false)
    }
  }

  async function generateFeed() {
    try {
      await fetch(`http://localhost:8000/jsonld/generate/?business_id=${id}`, {
        method: 'POST'
      })
      loadFeeds()
    } catch (err) {
      console.error(err)
    }
  }

  async function deleteFeed(feedId) {
    try {
      await fetch(`http://localhost:8000/jsonld/${feedId}`, { method: 'DELETE' })
      loadFeeds()
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
        <h2 className="page-title">JSON‑LD Feeds</h2>
        <button onClick={generateFeed}>Generate JSON‑LD</button>

        {loading ? (
          <p>Loading feeds...</p>
        ) : feeds.length === 0 ? (
          <p>No JSON‑LD feeds generated yet.</p>
        ) : (
          feeds.map(f => (
            <div key={f.feed_id} className="panel">
              <p><strong>Schema Type:</strong> {f.schema_type}</p>
              <pre className="code">{f.jsonld_data}</pre>
              <p><strong>Valid:</strong> {f.is_valid ? 'Yes' : 'No'}</p>
              {f.validation_errors && <p><strong>Errors:</strong> {f.validation_errors}</p>}
              <p><strong>Generated At:</strong> {f.generated_at}</p>
              <button className="ghost" onClick={() => deleteFeed(f.feed_id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
