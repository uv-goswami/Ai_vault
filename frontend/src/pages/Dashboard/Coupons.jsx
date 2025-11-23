import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
import '../../styles/dashboard.css'   // ✅ import dashboard styles

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
  const [showForm, setShowForm] = useState(false)   // ✅ toggle for add form

  useEffect(() => {
    loadCoupons()
  }, [id])

  async function loadCoupons() {
    try {
      const res = await fetch(`http://localhost:8000/coupons?business_id=${id}&limit=20&offset=0`)
      const data = await res.json()
      setCoupons(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function createCoupon() {
    try {
      await fetch(`http://localhost:8000/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: id, ...form })
      })
      setForm({ code: '', description: '', discount_value: '', valid_from: '', valid_until: '', terms_conditions: '' })
      setShowForm(false)   // ✅ hide form after adding
      loadCoupons()
    } catch (err) {
      console.error(err)
    }
  }

  async function updateCoupon(couponId) {
    try {
      await fetch(`http://localhost:8000/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      setEditing(null)
      setForm({ code: '', description: '', discount_value: '', valid_from: '', valid_until: '', terms_conditions: '' })
      loadCoupons()
    } catch (err) {
      console.error(err)
    }
  }

  async function deleteCoupon(couponId) {
    try {
      await fetch(`http://localhost:8000/coupons/${couponId}`, { method: 'DELETE' })
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
                    <input type="date" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })} />
                    <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} />
                    <textarea value={form.terms_conditions} onChange={e => setForm({ ...form, terms_conditions: e.target.value })} placeholder="Terms & Conditions" />
                    <button onClick={() => updateCoupon(c.coupon_id)}>Save</button>
                    <button onClick={() => setEditing(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <strong>{c.code}</strong>
                    <p>{c.description}</p>
                    <p>Discount: {c.discount_value}</p>
                    <p>Valid: {c.valid_from} → {c.valid_until}</p>
                    <p>{c.terms_conditions}</p>
                    <button onClick={() => {
                      setEditing(c.coupon_id)
                      setForm({
                        code: c.code,
                        description: c.description,
                        discount_value: c.discount_value,
                        valid_from: c.valid_from,
                        valid_until: c.valid_until,
                        terms_conditions: c.terms_conditions
                      })
                    }}>Edit</button>
                    <button onClick={() => deleteCoupon(c.coupon_id)}>Delete</button>
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
              <input type="date" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })} />
              <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} />
              <textarea placeholder="Terms & Conditions" value={form.terms_conditions} onChange={e => setForm({ ...form, terms_conditions: e.target.value })} />
              <button onClick={createCoupon}>Add Coupon</button>
              <button onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
