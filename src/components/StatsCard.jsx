// src/components/StatsCard.jsx
//
// Reusable stat tile used on the Delivery Dashboard
// (Total Assigned / Pending / Completed / Today's Deliveries).
//
// Kept generic and prop-driven so the dashboard can render four of
// these from a single array instead of repeating markup four times.

import React from "react";

/**
 * StatsCard
 * @param {string} label    - caption text, e.g. "Pending Deliveries"
 * @param {number|string} value - the big number to display
 * @param {string} icon     - emoji or short glyph shown in the icon slot
 * @param {string} accent   - hex color used for the icon chip + left rule,
 *                             lets each stat have its own identity color
 *                             (e.g. saffron for pending, teal for completed)
 */
const StatsCard = ({ label, value, icon, accent = "#FF8A3D" }) => {
  return (
    <div className="stats-card">
      {/* Left accent rule — a thin colored bar instead of a full-color
          card background, keeps the grid calm while still color-coding
          each metric at a glance. */}
      <span
        className="stats-card__rule"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />

      <div className="stats-card__body">
        <div
          className="stats-card__icon"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          {icon}
        </div>

        <div className="stats-card__text">
          <p className="stats-card__value">{value}</p>
          <p className="stats-card__label">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;