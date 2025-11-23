import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
import { getBusiness, updateBusiness } from '../../api/client'
import '../../styles/dashboard.css'

export default function Profile() {
  const { id } = useParams()
  const [business, setBusiness] = useState(null)
  const [form, setForm] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadBusiness()
  }, [id])

  async function loadBusiness() {
    setLoading(true)
    setError('')
    try {
      const data = await getBusiness(id)
      setBusiness(data)
      setForm(toEditable(data))
    } catch (e) {
      setError('Failed to load business profile.')
    } finally {
      setLoading(false)
    }
  }

  function toEditable(b) {
    return {
      name: b?.name || '',
      description: b?.description || '',
      business_type: b?.business_type || '',
      phone: b?.phone || '',
      website: b?.website || '',
      address: b?.address || '',
      latitude: b?.latitude ?? '',
      longitude: b?.longitude ?? '',
      timezone: b?.timezone || '',
      quote_slogan: b?.quote_slogan || '',
      identification_mark: b?.identification_mark || '',
      published: !!b?.published
    }
  }

  function onChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function onSave() {
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude)
      }
      const updated = await updateBusiness(id, payload)
      setBusiness(updated)
      setForm(toEditable(updated))
      setEditing(false)
    } catch (e) {
      setError('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function onCancel() {
    setForm(toEditable(business))
    setEditing(false)
    setError('')
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <SidebarNav />
      </div>
      <div className="dashboard-content">
        <h2 className="page-title">Business Profile</h2>

        {loading ? (
          <p>Loading...</p>
        ) : !business ? (
          <p>No business profile found.</p>
        ) : (
          <>
            {!editing ? (
              <div className="panel">
                <p><strong>Name:</strong> {business.name}</p>
                <p><strong>Description:</strong> {business.description || '-'}</p>
                <p><strong>Type:</strong> {business.business_type || '-'}</p>
                <p><strong>Phone:</strong> {business.phone || '-'}</p>
                <p><strong>Website:</strong> {business.website || '-'}</p>
                <p><strong>Address:</strong> {business.address || '-'}</p>
                <p><strong>Latitude:</strong> {business.latitude ?? '-'}</p>
                <p><strong>Longitude:</strong> {business.longitude ?? '-'}</p>
                <p><strong>Timezone:</strong> {business.timezone || '-'}</p>
                <p><strong>Quote/Slogan:</strong> {business.quote_slogan || '-'}</p>
                <p><strong>Identification mark:</strong> {business.identification_mark || '-'}</p>
                <p><strong>Published:</strong> {business.published ? 'Yes' : 'No'}</p>

                <div style={{ marginTop: '12px' }}>
                  <button className="ghost" onClick={() => setEditing(true)}>Edit profile</button>
                </div>
              </div>
            ) : (
              <div className="form-body">
                {error && <p style={{ color: '#c00' }}>{error}</p>}

                <label><strong>Name</strong></label>
                <input
                  value={form.name}
                  onChange={e => onChange('name', e.target.value)}
                  placeholder="Business name"
                />

                <label><strong>Description</strong></label>
                <textarea
                  value={form.description}
                  onChange={e => onChange('description', e.target.value)}
                  placeholder="Business description"
                  rows={3}
                />

                <label><strong>Type</strong></label>
                <input
                  value={form.business_type}
                  onChange={e => onChange('business_type', e.target.value)}
                  placeholder="e.g., restaurant, salon"
                />

                <label><strong>Phone</strong></label>
                <input
                  value={form.phone}
                  onChange={e => onChange('phone', e.target.value)}
                  placeholder="+91 98xxxxxxx"
                />

                <label><strong>Website</strong></label>
                <input
                  value={form.website}
                  onChange={e => onChange('website', e.target.value)}
                  placeholder="https://example.com"
                />

                <label><strong>Address</strong></label>
                <textarea
                  value={form.address}
                  onChange={e => onChange('address', e.target.value)}
                  placeholder="Street, City, State, ZIP"
                  rows={2}
                />

                <label><strong>Latitude</strong></label>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={e => onChange('latitude', e.target.value)}
                  placeholder="e.g., 28.6139"
                />

                <label><strong>Longitude</strong></label>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={e => onChange('longitude', e.target.value)}
                  placeholder="e.g., 77.2090"
                />

                <label><strong>Timezone</strong></label>
                <input
                  value={form.timezone}
                  onChange={e => onChange('timezone', e.target.value)}
                  placeholder="e.g., Asia/Kolkata"
                />

                <label><strong>Quote/Slogan</strong></label>
                <input
                  value={form.quote_slogan}
                  onChange={e => onChange('quote_slogan', e.target.value)}
                  placeholder="Short tagline"
                />

                <label><strong>Identification mark</strong></label>
                <input
                  value={form.identification_mark}
                  onChange={e => onChange('identification_mark', e.target.value)}
                  placeholder="Landmark or identifier"
                />

                <label style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={e => onChange('published', e.target.checked)}
                  />
                  <strong>Published</strong>
                </label>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button onClick={onSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button className="ghost" onClick={onCancel} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
