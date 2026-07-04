// src/pages/DeliveryDashboard.jsx
//
// Delivery Dashboard page: welcome card, 4 key stats, and a preview
// of recent assigned orders. Pulls everything from the dummy
// deliveryApi service via useEffect on mount.

import React, { useState, useEffect } from "react";
import StatsCard from "../components/StatsCard";
import OrderCard from "../components/OrderCard";
import {
  fetchDashboardStats,
  fetchAssignedOrders,
  fetchDeliveryProfile,
} from "../services/deliveryApi";
import "../styles/dashboard.css";

/**
 * DeliveryDashboard
 * @param {function} onViewOrderDetails - bubbles up to the shell, e.g. to
 *                                         open a details view/page
 * @param {function} onUpdateOrderStatus - bubbles up to the shell, e.g. to
 *                                          navigate to Update Status with
 *                                          the chosen order pre-selected
 */
const DeliveryDashboard = ({ onViewOrderDetails, onUpdateOrderStatus }) => {
  // Profile is needed for the welcome card's greeting + rating.
  const [profile, setProfile] = useState(null);

  // Dashboard stat tiles (computed from the orders list on the backend/mock).
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    todaysDeliveries: 0,
  });

  // Most recent orders, capped to a handful for the dashboard preview.
  const [recentOrders, setRecentOrders] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  // Load everything once when the page mounts.
  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      const [profileData, statsData, ordersData] = await Promise.all([
        fetchDeliveryProfile(),
        fetchDashboardStats(),
        fetchAssignedOrders(),
      ]);

      if (!isMounted) return; // avoid setting state after unmount

      setProfile(profileData);
      setStats(statsData);
      // Show only the 4 most recent orders on the dashboard, newest first.
      const sorted = [...ordersData].sort(
        (a, b) => new Date(b.placedAt) - new Date(a.placedAt)
      );
      setRecentOrders(sorted.slice(0, 4));
      setIsLoading(false);
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Build today's date in a friendly format for the welcome card.
  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* ---------------- Welcome card ---------------- */}
      <section className="welcome-card">
        <div>
          <p className="welcome-card__eyebrow">{todayLabel}</p>
          <h1 className="welcome-card__title">
            Welcome back, {profile?.name?.split(" ")[0]} 👋
          </h1>
          <p className="welcome-card__subtitle">
            You have {stats.pendingDeliveries} delivery
            {stats.pendingDeliveries === 1 ? "" : "ies"} pending. Stay safe on
            the road and keep the tickets moving.
          </p>
        </div>

        <div className="welcome-card__meta">
          <div className="welcome-card__meta-item">
            <span className="welcome-card__meta-value">
              {profile?.rating}★
            </span>
            <span className="welcome-card__meta-label">Rating</span>
          </div>
          <div className="welcome-card__meta-item">
            <span className="welcome-card__meta-value">
              {profile?.totalDeliveries}
            </span>
            <span className="welcome-card__meta-label">Lifetime trips</span>
          </div>
        </div>
      </section>

      {/* ---------------- Stat tiles ---------------- */}
      <section className="stats-grid">
        <StatsCard
          label="Total Assigned Orders"
          value={stats.totalAssigned}
          icon="📦"
          accent="#FF8A3D"
        />
        <StatsCard
          label="Pending Deliveries"
          value={stats.pendingDeliveries}
          icon="⏳"
          accent="#B45309"
        />
        <StatsCard
          label="Completed Deliveries"
          value={stats.completedDeliveries}
          icon="✅"
          accent="#0F766E"
        />
        <StatsCard
          label="Today's Deliveries"
          value={stats.todaysDeliveries}
          icon="📅"
          accent="#1D4ED8"
        />
      </section>

      {/* ---------------- Recent assigned orders ---------------- */}
      <section>
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">Recent Assigned Orders</h2>
        </div>

        {recentOrders.length === 0 ? (
          <div className="orders-empty">
            <span className="orders-empty__icon">🛵</span>
            No orders assigned yet. New tickets will show up here.
          </div>
        ) : (
          <div className="recent-orders-grid">
            {recentOrders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onViewDetails={onViewOrderDetails}
                onUpdateStatus={onUpdateOrderStatus}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DeliveryDashboard;