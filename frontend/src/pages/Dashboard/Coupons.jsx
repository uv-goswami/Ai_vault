import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
import '../../styles/dashboard.css'
import { API_BASE } from '../../api/client'

export default function Coupons() {
  const { id } = useParams()
  const [coupons, setCoupons] = useState([])
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_value: '',
    valid_from: '',
    valid_until: '',
    terms_conditions: ''
  })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadCoupons()
  }, [id])

  async function loadCoupons() {
    try {
      const res = await fetch(`${API_BASE}/coupons?business_id=${id}&limit=20&offset=0`)
      const data = await res.json()
      setCoupons(data)
    } catch (err) {
      console.error(err)
    }
  }

  // ✅ Helper: Format date for HTML Input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    return dateString.split('T')[0] 
  }

  // ✅ Helper: Clean data before sending to Backend
  // IMPORTANT: Converts empty strings "" to null so the backend doesn't reject them
  const getCleanPayload = (formData) => {
    return {
      code: formData.code,
      description: formData.description || null,
      discount_value: formData.discount_value || null,
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
      terms_conditions: formData.terms_conditions || null
    }
  }

  async function createCoupon() {
    try {
      const payload = getCleanPayload(form)
      
      const res = await fetch(`${API_BASE}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: id, ...payload })
      })

      if (!res.ok) {
        const errorData = await res.json()
        alert(`Error: ${JSON.stringify(errorData.detail)}`)
        return
      }

      // Reset form
      setForm({ code: '', description: '', discount_value: '', valid_from: '', valid_until: '', terms_conditions: '' })
      setShowForm(false)
      loadCoupons()
    } catch (err) {
      console.error(err)
      alert("Network error occurred")
    }
  }

  async function updateCoupon(couponId) {
    try {
      const payload = getCleanPayload(form)

      const res = await fetch(`${API_BASE}/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Update failed:", errorData)
        // This will tell you EXACTLY which field is causing the 422 error
        alert(`Update failed: ${JSON.stringify(errorData.detail)}`) 
        return
      }

      setEditing(null)
      setForm({ code: '', description: '', discount_value: '', valid_from: '', valid_until: '', terms_conditions: '' })
      loadCoupons()
    } catch (err) {
      console.error(err)
      alert("Network error occurred")
    }
  }

  async function deleteCoupon(couponId) {
    try {
      await fetch(`${API_BASE}/coupons/${couponId}`, { method: 'DELETE' })
      loadCoupons()
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
        <h2 className="page-title">Coupons</h2>

        {/* List coupons */}
        <div className="collapsible-section">
          {coupons.length === 0 ? (
            <p>No coupons available.</p>
          ) : (
            coupons.map(c => (
              <div key={c.coupon_id} className="panel">
                {editing === c.coupon_id ? (
                  <>
                    <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Code" />
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" />
                    <input value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} placeholder="Discount Value" />
                    
                    {/* ✅ Corrected Date Inputs with Labels */}
                    <label style={{fontSize: '0.8rem', color: '#666', marginTop: '5px', display: 'block'}}>Valid From:</label>
                    <input type="date" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })} />
                    
                    <label style={{fontSize: '0.8rem', color: '#666', marginTop: '5px', display: 'block'}}>Valid Until:</label>
                    <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} />
                    
                    <textarea value={form.terms_conditions} onChange={e => setForm({ ...form, terms_conditions: e.target.value })} placeholder="Terms & Conditions" />
                    
                    <div style={{marginTop: '10px'}}>
                        <button onClick={() => updateCoupon(c.coupon_id)}>Save</button>
                        <button className="ghost" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <strong>{c.code}</strong>
                    <p>{c.description}</p>
                    <p>Discount: {c.discount_value}</p>
                    {/* ✅ Display readable date */}
                    <p>Valid: {formatDateForInput(c.valid_from)} → {formatDateForInput(c.valid_until)}</p>
                    <p>{c.terms_conditions}</p>
                    <button onClick={() => {
                      setEditing(c.coupon_id)
                      // ✅ FIX: Format dates safely before putting into state
                      setForm({
                        code: c.code,
                        description: c.description || '',
                        discount_value: c.discount_value || '',
                        valid_from: formatDateForInput(c.valid_from),
                        valid_until: formatDateForInput(c.valid_until),
                        terms_conditions: c.terms_conditions || ''
                      })
                    }}>Edit</button>
                    <button className="ghost" onClick={() => deleteCoupon(c.coupon_id)}>Delete</button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Toggle Add Coupon Form */}
        {!showForm ? (
          <button className="ghost" onClick={() => setShowForm(true)}>Add Coupon</button>
        ) : (
          <div className="collapsible-section">
            <h3 className="form-title">Add New Coupon</h3>
            <div className="form-body">
              <input placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input placeholder="Discount Value" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} />
              
              <label style={{fontSize: '0.8rem', color: '#666', marginTop: '5px', display: 'block'}}>Valid From:</label>
              <input type="date" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })} />
              
              <label style={{fontSize: '0.8rem', color: '#666', marginTop: '5px', display: 'block'}}>Valid Until:</label>
              <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} />
              
              <textarea placeholder="Terms & Conditions" value={form.terms_conditions} onChange={e => setForm({ ...form, terms_conditions: e.target.value })} />
              
              <div style={{marginTop: '10px'}}>
                  <button onClick={createCoupon}>Add Coupon</button>
                  <button className="ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}