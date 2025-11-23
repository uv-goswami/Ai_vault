import React from 'react'
import '../styles/base.css'   // global utility styles
import '../styles/theme.css'  // shared theme styles

/**
 * FormSection
 * A reusable wrapper for form inputs with a title and description.
 * Responsive layout ensures alignment on both desktop and mobile.
 */
export default function FormSection({ title, description, children }) {
  return (
    <section className="form-section">
      <div className="form-header">
        <h3 className="form-title">{title}</h3>
        {description && <p className="form-desc">{description}</p>}
      </div>
      <div className="form-body">
        {children}
      </div>
    </section>
  )
}
