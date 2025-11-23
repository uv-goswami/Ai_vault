import React, { useState } from 'react'
import '../styles/collapsible.css'

export default function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="collapsible-section">
      <button className="collapsible-header" onClick={() => setOpen(!open)}>
        {title}
        <span className="toggle-icon">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="collapsible-content">{children}</div>}
    </div>
  )
}
