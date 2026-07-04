// src/components/StatusBadge.jsx
//
// Small reusable "stamp" style badge that shows an order's current
// delivery status. Used on the Dashboard, Assigned Orders, and
// Update Status pages.
//
// NOTE: Colors are computed inline (rather than via an external
// stylesheet) because this badge is dropped into multiple pages that
// each load their own CSS file — inline mapping guarantees the badge
// always looks correct no matter which page renders it.

import React from "react";

// Map each possible status to a color pair (background tint + text/border).
// Centralizing this map means adding a new status later only requires
// one new entry here.
const STATUS_STYLES = {
  Assigned: {
    background: "#FFF1E6",
    color: "#C2540B",
    border: "#FFD3AD",
  },
  "Picked Up": {
    background: "#EAF2FE",
    color: "#1D4ED8",
    border: "#BFDBFE",
  },
  "Out for Delivery": {
    background: "#FFF7E0",
    color: "#B45309",
    border: "#FDE68A",
  },
  Delivered: {
    background: "#E6F6F2",
    color: "#0F766E",
    border: "#A8E6D6",
  },
};

// Fallback style for any unexpected/unknown status value, so the UI
// never silently breaks if bad data slips through.
const DEFAULT_STYLE = {
  background: "#F1F5F9",
  color: "#475569",
  border: "#E2E8F0",
};

/**
 * StatusBadge
 * @param {string} status - one of the STATUS_OPTIONS values
 * @param {string} size - "sm" | "md" (controls padding/font-size)
 */
const StatusBadge = ({ status, size = "md" }) => {
  const palette = STATUS_STYLES[status] || DEFAULT_STYLE;

  const isSmall = size === "sm";

  return (
    <span
      // The "stamp" look: a pill with a dashed inner border feel,
      // monospaced uppercase text to echo the courier-ticket motif
      // used across the module's order cards.
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: isSmall ? "3px 10px" : "5px 14px",
        borderRadius: "999px",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        fontSize: isSmall ? "11px" : "12.5px",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        backgroundColor: palette.background,
        color: palette.color,
        border: `1px solid ${palette.border}`,
      }}
    >
      {/* Small dot indicator adds a quick "at a glance" signal,
          useful when scanning a long list of order cards. */}
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: palette.color,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
};

export default StatusBadge;