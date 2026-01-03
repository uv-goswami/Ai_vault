import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
// ✅ Import getFromCache
import { listMedia, uploadMediaFile, deleteMedia, API_BASE, getFromCache } from '../../api/client'
import '../../styles/dashboard.css'

export default function Media() {
  const { id } = useParams()
  
  // 🚀 INSTANT LOAD: Initialize state from cache
  const [media, setMedia] = useState(() => {
    const cached = getFromCache(`/media/?business_id=${id}&limit=100&offset=0`)
    return Array.isArray(cached) ? cached : []
  })

  const [form, setForm] = useState({ media_type: null, file: null })
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState(null)

  // 🚀 REVALIDATE: Fetch fresh data in background
  useEffect(() => {
    loadMedia()
  }, [id])

  async function loadMedia() {
    try {
      const data = await listMedia(id, 100, 0)
      setMedia(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleUpload() {
    try {
      if (!form.file || !form.media_type) return

      // ✅ Frontend validation for max size (50 MB)
      if (form.file.size > 50 * 1024 * 1024) {
        setError('File too large. Max allowed size is 50 MB.')
        return
      }

      await uploadMediaFile(id, form.media_type, form.file)
      setForm({ media_type: null, file: null })
      setShowForm(false)
      setError(null)
      loadMedia()
    } catch (err) {
      console.error(err)
      setError('Upload failed. Please check file type and size.')
    }
  }

  async function handleDelete(assetId) {
    try {
      await deleteMedia(assetId)
      loadMedia()
    } catch (err) {
      console.error(err)
    }
  }

  // ✅ Auto-detect media type from file extension
  function detectMediaType(file) {
    if (!file) return null
    const ext = file.name.split('.').pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image'
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return 'video'
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'document'
    return null
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <SidebarNav />
      </div>
      <div className="dashboard-content">
        <h2 className="page-title">Media Assets</h2>

        {error && <p className="error">{error}</p>}

        {media.length === 0 ? (
          <p>No media uploaded.</p>
        ) : (
          media.map(m => (
            <div key={m.asset_id} className="panel">
              <p><strong>Type:</strong> {m.media_type}</p>

              {/* ✅ Render actual media using API_BASE */}
              {m.media_type === 'image' && (
                <img
                  src={`${API_BASE}${m.url}`}
                  alt="Uploaded"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              )}
              {m.media_type === 'video' && (
                <video controls style={{ maxWidth: '100%' }}>
                  <source src={`${API_BASE}${m.url}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              {m.media_type === 'document' && (
                <p>
                  <strong>Document:</strong>{' '}
                  <a
                    href={`${API_BASE}${m.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View file
                  </a>
                </p>
              )}

              <button className="ghost" onClick={() => handleDelete(m.asset_id)}>Delete</button>
            </div>
          ))
        )}

        {!showForm ? (
          <button className="ghost" onClick={() => setShowForm(true)}>Upload Media</button>
        ) : (
          <div className="form-section">
            <div className="form-header">
              <h3 className="form-title">Upload Media</h3>
              <p className="form-desc">Choose a file from your device (max 50 MB)</p>
            </div>
            <div className="form-body">
              <input
                type="file"
                onChange={e => {
                  const file = e.target.files[0]
                  const type = detectMediaType(file)
                  if (!type) {
                    setError('Unsupported file type. Only images, videos, and documents are allowed.')
                    setForm({ media_type: null, file: null })
                  } else {
                    setError(null)
                    setForm({ media_type: type, file })
                  }
                }}
              />
              <button onClick={handleUpload}>Upload</button>
              <button onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}