import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
import '../../styles/dashboard.css'
// 1. Import API_BASE to handle the connection URL
import { API_BASE } from '../../api/client'

export default function Metadata() {
  const { id } = useParams()
  const [metadata, setMetadata] = useState([])

  useEffect(() => {
    loadMetadata()
  }, [id])

  async function loadMetadata() {
    try {
      // Fetch metadata using the dynamic API_BASE
      const res = await fetch(`${API_BASE}/ai-metadata?business_id=${id}&limit=20&offset=0`)
      const data = await res.json()
      setMetadata(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function generateMetadata() {
    try {
      // Post request to generate metadata
      await fetch(`${API_BASE}/ai-metadata/generate?business_id=${id}`, {
        method: 'POST'
      })
      loadMetadata()
    } catch (err) {
      console.error(err)
    }
  }

  async function deleteMetadata(metaId) {
    try {
      // Delete request
      await fetch(`${API_BASE}/ai-metadata/${metaId}`, { method: 'DELETE' })
      loadMetadata()
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
        <h2 className="page-title">AI Metadata</h2>
        <button onClick={generateMetadata}>Generate Metadata</button>

        {metadata.length === 0 ? (
          <p>No metadata generated yet.</p>
        ) : (
          metadata.map(m => (
            <div key={m.ai_metadata_id} className="panel">
              <p><strong>Insights:</strong> {m.extracted_insights}</p>
              <p><strong>Entities:</strong> {m.detected_entities}</p>
              <p><strong>Keywords:</strong> {m.keywords}</p>
              <p><strong>Labels:</strong> {m.intent_labels}</p>
              <button className="ghost" onClick={() => deleteMetadata(m.ai_metadata_id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}