import React from 'react'
import '../styles/theme.css'   // shared panel + grid styles
import '../styles/base.css'    // global resets + typography

/**
 * StatCard
 * Displays a single statistic with a title and value.
 * Props:
 * - title: string (label for the stat)
 * - value: string | number (statistic value)
 * - icon?: ReactNode (optional icon to display)
 */
export default function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card panel">
      <div className="stat-content">
        {icon && <div className="stat-icon">{icon}</div>}
        <div className="stat-text">
          <h4 className="stat-title">{title}</h4>
          <div className="stat-value">{value}</div>
        </div>
      </div>
    </div>
  )
}
