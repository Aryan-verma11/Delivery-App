// src/pages/AssignedOrders.jsx
//
// Assigned Orders page: full list of orders with a status filter bar
// and a search box (by customer name or order id). Each order renders
// as an OrderCard with "View Details" and "Update Status" actions.

import React, { useState, useEffect, useMemo } from "react";
import OrderCard from "../components/OrderCard";
import { fetchAssignedOrders, STATUS_OPTIONS } from "../services/deliveryApi";
import "../styles/dashboard.css"; // shared .order-ticket / .btn styles
import "../styles/orders.css";

/**
 * AssignedOrders
 * @param {function} onViewOrderDetails  - called with orderId
 * @param {function} onUpdateOrderStatus - called with orderId
 */
const AssignedOrders = ({ onViewOrderDetails, onUpdateOrderStatus }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // "All" plus every value from STATUS_OPTIONS, built once.
  const filterOptions = useMemo(() => ["All", ...STATUS_OPTIONS], []);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Load orders once on mount.
  useEffect(() => {
    let isMounted = true;

    fetchAssignedOrders().then((data) => {
      if (isMounted) {
        setOrders(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Re-derive the visible list whenever filter/search/orders change,
  // instead of storing a separate "filtered" state (single source of truth).
  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "All" || order.status === activeFilter;

      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        order.customerName.toLowerCase().includes(term) ||
        order.orderId.toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, searchTerm]);

  if (isLoading) {
    return (
      <div className="orders-page">
        <p>Loading assigned orders…</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      {/* ---------------- Header ---------------- */}
      <div className="orders-page__header">
        <div>
          <h1 className="orders-page__title">Assigned Orders</h1>
          <p className="orders-page__subtitle">
            {visibleOrders.length} of {orders.length} orders shown
          </p>
        </div>
      </div>

      {/* ---------------- Filter bar ---------------- */}
      <div className="orders-filter-bar">
        {filterOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={`orders-filter-chip ${
              activeFilter === option ? "orders-filter-chip--active" : ""
            }`}
            onClick={() => setActiveFilter(option)}
          >
            {option}
          </button>
        ))}

        <div className="orders-search">
          <span className="orders-search__icon">🔍</span>
          <input
            type="text"
            placeholder="Search by customer or order ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ---------------- Orders grid ---------------- */}
      {visibleOrders.length === 0 ? (
        <div className="orders-empty">
          <span className="orders-empty__icon">🛵</span>
          No orders match this filter or search.
        </div>
      ) : (
        <div className="orders-grid">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              onViewDetails={onViewOrderDetails}
              onUpdateStatus={onUpdateOrderStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedOrders;