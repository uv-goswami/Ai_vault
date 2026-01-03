import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
import '../../styles/dashboard.css'
// ✅ Import API_BASE, getFromCache, and client functions
import { 
  API_BASE, 
  getFromCache, 
  listAiMetadata, 
  generateAiMetadata 
} from '../../api/client'

export default function Metadata() {
  const { id } = useParams()
  
  // 🚀 INSTANT LOAD: Initialize state from cache
  // We match the URL structure used in client.js exactly
  const [metadata, setMetadata] = useState(() => {
    const cached = getFromCache(`/ai-metadata/?business_id=${id}&limit=20&offset=0`)
    return Array.isArray(cached) ? cached : []
  })

  // 🚀 REVALIDATE: Fetch fresh data in background
  useEffect(() => {
    loadMetadata()
  }, [id])

  async function loadMetadata() {
    try {
      // Use client function to populate cache
      const data = await listAiMetadata(id, 20, 0)
      setMetadata(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleGenerate() {
    try {
      // POST request clears the cache automatically (via client.js)
      await generateAiMetadata(id)
      loadMetadata()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(metaId) {
    try {
      // 1. Send Delete Request (Raw fetch since no helper exists)
      const res = await fetch(`${API_BASE}/ai-metadata/${metaId}`, { method: 'DELETE' })
      
      if (res.ok) {
        // 2. Optimistic Update: Remove from UI immediately
        // We do this instead of reloading because raw fetch doesn't clear the cache,
        // so loading again would show the stale (deleted) item.
        setMetadata(prev => prev.filter(m => m.ai_metadata_id !== metaId))
      }
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
        <button onClick={handleGenerate}>Generate Metadata</button>

        {metadata.length === 0 ? (
          <p>No metadata generated yet.</p>
        ) : (
          metadata.map(m => (
            <div key={m.ai_metadata_id} className="panel">
              <p><strong>Insights:</strong> {m.extracted_insights}</p>
              <p><strong>Entities:</strong> {m.detected_entities}</p>
              <p><strong>Keywords:</strong> {m.keywords}</p>
              <p><strong>Labels:</strong> {m.intent_labels}</p>
              <button className="ghost" onClick={() => handleDelete(m.ai_metadata_id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 