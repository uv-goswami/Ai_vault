import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
// ✅ Import getFromCache
import {
  getOperationalInfoByBusiness,
  createOperationalInfo,
  updateOperationalInfoByBusiness,
  deleteOperationalInfoByBusiness,
  getFromCache
} from '../../api/client'
import '../../styles/dashboard.css'

export default function OperationalInfo() {
  const { id } = useParams()
  
  // 🚀 INSTANT LOAD: Initialize state from cache
  const [info, setInfo] = useState(() => {
    return getFromCache(`/operational-info/by-business/${id}`) || null
  })

  const [form, setForm] = useState({
    opening_hours: '',
    closing_hours: '',
    off_days: [],
    delivery_options: '',
    reservation_options: '',
    wifi_available: false,
    accessibility_features: '',
    nearby_parking_spot: '',
    special_notes: ''
  })
  const [editing, setEditing] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // 🚀 REVALIDATE: Fetch fresh data in background
  useEffect(() => {
    loadInfo()
  }, [id])

  async function loadInfo() {
    try {
      const data = await getOperationalInfoByBusiness(id)
      setInfo(data)

      setForm({
        opening_hours: convertTo12Hour(data.opening_hours || ''),
        closing_hours: convertTo12Hour(data.closing_hours || ''),
        off_days: data.off_days || [],
        delivery_options: data.delivery_options || '',
        reservation_options: data.reservation_options || '',
        wifi_available: data.wifi_available || false,
        accessibility_features: data.accessibility_features || '',
        nearby_parking_spot: data.nearby_parking_spot || '',
        special_notes: data.special_notes || ''
      })
    } catch {
      // Don't nullify info on error if we have cached data, 
      // but here we stick to original logic (or you could refine error handling)
      if (!info) setInfo(null)
    }
  }

  // Convert "14:30" → "02:30 PM"
  function convertTo12Hour(time) {
    if (!time.includes(":")) return time
    try {
      let [hour, minute] = time.split(":").map(Number)
      const ampm = hour >= 12 ? "PM" : "AM"
      hour = hour % 12 || 12
      return `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')} ${ampm}`
    } catch {
      return time
    }
  }

  // Convert "02:30 PM" → "14:30"
  function convertTo24Hour(str) {
    try {
      let [time, ampm] = str.split(" ")
      let [hour, minute] = time.split(":").map(Number)

      if (ampm === "PM" && hour !== 12) hour += 12
      if (ampm === "AM" && hour === 12) hour = 0

      return `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`
    } catch {
      return str
    }
  }

  async function saveInfo() {
    try {
      const payload = {
        business_id: id,
        ...form,
        opening_hours: convertTo24Hour(form.opening_hours),
        closing_hours: convertTo24Hour(form.closing_hours)
      }

      if (info) {
        await updateOperationalInfoByBusiness(id, payload)
      } else {
        await createOperationalInfo(payload)
      }

      setEditing(false)
      loadInfo()
    } catch (err) {
      console.error(err)
    }
  }

  async function deleteInfo() {
    try {
      await deleteOperationalInfoByBusiness(id)
      setInfo(null)
      setEditing(false)
    } catch (err) {
      console.error(err)
    }
  }

  function formatTime24To12(raw) {
    return convertTo12Hour(raw)
  }

  const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

  function toggleDay(day) {
    setForm(prev => {
      const exists = prev.off_days.includes(day)
      return {
        ...prev,
        off_days: exists
          ? prev.off_days.filter(d => d !== day)
          : [...prev.off_days, day]
      }
    })
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <SidebarNav />
      </div>

      <div className="dashboard-content">
        <h2 className="page-title">Operational Info</h2>

        {!info && !editing && <p>No operational info yet. Click add to create details.</p>}

        {editing ? (
          <div className="form-section">
            <div className="form-header">
              <h3 className="form-title">{info ? 'Edit Operational Info' : 'Add Operational Info'}</h3>
            </div>

            <div className="form-body">

              {/* OPEN TIME */}
              <input
                type="text"
                placeholder="Opening Hours (HH:MM AM/PM)"
                value={form.opening_hours}
                onChange={e => setForm({ ...form, opening_hours: e.target.value })}
              />

              {/* CLOSE TIME */}
              <input
                type="text"
                placeholder="Closing Hours (HH:MM AM/PM)"
                value={form.closing_hours}
                onChange={e => setForm({ ...form, closing_hours: e.target.value })}
              />

              {/* OFF DAYS */}
              <div className="form-group">
                <button type="button" className="ghost" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {form.off_days.length > 0 ? `Selected: ${form.off_days.join(', ')}` : 'Select Off Days'}
                </button>

                {dropdownOpen && (
                  <div className="panel">
                    {weekdays.map(day => (
                      <div key={day} className="dropdown-item" onClick={() => toggleDay(day)}>
                        {day} {form.off_days.includes(day) && '✓'}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Delivery Options"
                value={form.delivery_options}
                onChange={e => setForm({ ...form, delivery_options: e.target.value })}
              />

              <input
                type="text"
                placeholder="Reservation Options"
                value={form.reservation_options}
                onChange={e => setForm({ ...form, reservation_options: e.target.value })}
              />

              <label>
                <input
                  type="checkbox"
                  checked={form.wifi_available}
                  onChange={e => setForm({ ...form, wifi_available: e.target.checked })}
                />
                WiFi Available
              </label>

              <input
                type="text"
                placeholder="Accessibility Features"
                value={form.accessibility_features}
                onChange={e => setForm({ ...form, accessibility_features: e.target.value })}
              />

              <input
                type="text"
                placeholder="Nearby Parking Spot"
                value={form.nearby_parking_spot}
                onChange={e => setForm({ ...form, nearby_parking_spot: e.target.value })}
              />

              <textarea
                placeholder="Special Notes"
                value={form.special_notes}
                onChange={e => setForm({ ...form, special_notes: e.target.value })}
              />

              <button onClick={saveInfo}>Save</button>
              {info && <button onClick={deleteInfo}>Delete</button>}
              <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          info && (
            <div className="panel">
              <p><strong>Hours:</strong> {formatTime24To12(info.opening_hours)} → {formatTime24To12(info.closing_hours)}</p>
              <p><strong>Off Days:</strong> {info.off_days?.join(', ')}</p>
              <p><strong>Delivery Options:</strong> {info.delivery_options}</p>
              <p><strong>Reservation Options:</strong> {info.reservation_options}</p>
              <p><strong>WiFi:</strong> {info.wifi_available ? 'Available' : 'Not Available'}</p>
              <p><strong>Accessibility:</strong> {info.accessibility_features}</p>
              <p><strong>Parking:</strong> {info.nearby_parking_spot}</p>
              <p><strong>Special Notes:</strong> {info.special_notes}</p>

              <button onClick={() => setEditing(true)}>Edit</button>
              <button onClick={deleteInfo}>Delete</button>
            </div>
          )
        )}

        {!editing && (
          <button className="ghost" onClick={() => setEditing(true)}>
            {info ? 'Edit Info' : 'Add Info'}
          </button>
        )}
      </div>
    </div>
  )
}