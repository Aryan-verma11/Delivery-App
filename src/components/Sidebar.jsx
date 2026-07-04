// src/components/Sidebar.jsx
//
// Left-hand navigation for the four Delivery Module pages.
// Deliberately built WITHOUT react-router-dom so this module can be
// dropped into any host app's routing setup without extra dependencies —
// navigation is controlled via a simple `activePage` + `onNavigate`
// callback pair owned by the parent (DeliveryModule shell).

import React from "react";

// Centralized nav config: label, key, and icon glyph in one place,
// so adding/removing a page only means editing this one array.
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "▣" },
  { key: "orders", label: "Assigned Orders", icon: "▤" },
  { key: "status", label: "Update Status", icon: "◷" },
  { key: "profile", label: "Profile", icon: "◉" },
];

/**
 * Sidebar
 * @param {string} activePage   - key of the currently active page
 * @param {function} onNavigate - called with the clicked item's key
 * @param {boolean} isOpen      - whether the off-canvas sidebar is open (mobile)
 * @param {function} onClose    - closes the off-canvas sidebar (mobile)
 */
const Sidebar = ({ activePage, onNavigate, isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop only renders (and is clickable) on mobile when open,
          tapping it closes the sidebar — handled purely via CSS classes. */}
      <div
        className={`sidebar__backdrop ${isOpen ? "sidebar__backdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <span className="sidebar__eyebrow">Delivery Console</span>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={`sidebar__nav-item ${
                  isActive ? "sidebar__nav-item--active" : ""
                }`}
                onClick={() => {
                  onNavigate(item.key);
                  onClose(); // collapse on mobile after picking a page
                }}
              >
                <span className="sidebar__nav-icon">{item.icon}</span>
                <span className="sidebar__nav-label">{item.label}</span>
                {/* Active marker bar, lights up next to the current page */}
                {isActive && <span className="sidebar__nav-active-bar" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <p className="sidebar__footer-text">
            On the road, on time —<br /> every ticket counts.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;