import React from 'react'
import '../styles/theme.css'   // shared panel + utility styles
import '../styles/base.css'    // global resets + typography

/**
 * JsonBlock
 * Displays a block of JSON or structured data in a styled, scrollable panel.
 * Props:
 * - title: string (heading for the block)
 * - data: object or string (JSON data to render)
 */
export default function JsonBlock({ title, data }) {
  // Ensure data is stringified nicely
  const formatted =
    typeof data === 'string'
      ? data
      : JSON.stringify(data, null, 2)

  return (
    <section className="json-block panel">
      {title && <h3 className="json-title">{title}</h3>}
      <pre className="code json-content">
        {formatted}
      </pre>
    </section>
  )
}
