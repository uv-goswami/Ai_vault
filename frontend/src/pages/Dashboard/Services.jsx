import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SidebarNav from '../../components/SidebarNav'
import { listServices, createService, updateService, deleteService } from '../../api/client'
import '../../styles/dashboard.css'

export default function Services() {
  const { id } = useParams()
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name: '', description: '', price: '', service_type: 'restaurant' })
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    refresh()
  }, [id])

  async function refresh() {
    listServices(id, 100, 0).then(setServices).catch(() => {})
  }

  async function onCreate(e) {
    e.preventDefault()
    await createService({ business_id: id, ...form, price: Number(form.price) })
    setForm({ name: '', description: '', price: '', service_type: 'restaurant' })
    refresh()
  }

  async function onUpdate(serviceId) {
    await updateService(serviceId, { ...form, price: Number(form.price) })
    setEditing(null)
    refresh()
  }

  async function onDelete(serviceId) {
    await deleteService(serviceId)
    refresh()
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <SidebarNav />
      </div>
      <div className="dashboard-content">
        <h2 className="page-title">Services</h2>

        {services.length === 0 ? (
          <p>No services listed.</p>
        ) : (
          services.map(s => (
            <div key={s.service_id} className="panel">
              {editing === s.service_id ? (
                <>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                  <button onClick={() => onUpdate(s.service_id)}>Save</button>
                  <button className="ghost" onClick={() => setEditing(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <strong>{s.name}</strong>
                  <p>{s.description}</p>
                  <p>₹{s.price}</p>
                  <div style={{ marginTop: '8px' }}>
                    <button className="ghost" onClick={() => { setEditing(s.service_id); setForm(s) }}>Edit</button>
                    <button className="ghost" onClick={() => onDelete(s.service_id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}

        <div className="form-body" style={{ marginTop: '20px' }}>
          <h3>Add New Service</h3>
          <form onSubmit={onCreate}>
            <input
              placeholder="Service name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
            <select
              value={form.service_type}
              onChange={e => setForm({ ...form, service_type: e.target.value })}
            >
              <option value="restaurant">Restaurant</option>
              <option value="salon">Salon</option>
              <option value="clinic">Clinic</option>
            </select>
            <button type="submit">Create Service</button>
          </form>
        </div>
      </div>
    </div>
  )
}
