// src/components/Navbar.jsx
//
// Top navigation bar shown on every page of the Delivery Module.
// Shows the brand mark, a quick online/offline availability toggle,
// and the partner's avatar (mirrors data from DeliveryProfile so the
// partner always sees their current status without opening Profile).

import React from "react";

/**
 * Navbar
 * @param {string} partnerName   - delivery partner's display name
 * @param {string} photoUrl      - avatar image url
 * @param {string} availability  - "Online" | "Offline"
 * @param {function} onToggleAvailability - flips availability state
 * @param {function} onMenuClick - opens the sidebar on mobile/tablet
 */
const Navbar = ({
  partnerName,
  photoUrl,
  availability,
  onToggleAvailability,
  onMenuClick,
}) => {
  const isOnline = availability === "Online";

  return (
    <header className="navbar">
      <div className="navbar__left">
        {/* Hamburger button — only visible at mobile/tablet widths via CSS,
            opens the off-canvas sidebar. */}
        <button
          type="button"
          className="navbar__menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Brand mark: a small route-pin glyph instead of a generic logo,
            ties back to the "courier dispatch" identity. */}
        <div className="navbar__brand">
          <span className="navbar__brand-mark">⛟</span>
          <span className="navbar__brand-text">
            Food delivery <span className="navbar__brand-accent">System</span>
          </span>
        </div>
      </div>

      <div className="navbar__right">
        {/* Availability toggle: quick switch without leaving the page */}
        <button
          type="button"
          className={`navbar__status-toggle ${
            isOnline ? "navbar__status-toggle--online" : "navbar__status-toggle--offline"
          }`}
          onClick={onToggleAvailability}
        >
          <span className="navbar__status-dot" />
          {isOnline ? "Online" : "Offline"}
        </button>

        <div className="navbar__profile">
          <img
            src={photoUrl}
            alt={partnerName}
            className="navbar__avatar"
          />
          <span className="navbar__partner-name">{partnerName}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;