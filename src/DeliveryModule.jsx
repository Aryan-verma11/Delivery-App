// src/DeliveryModule.jsx
//
// Top-level shell for the Delivery Module. Wires together the Navbar,
// Sidebar, and the four pages using simple state-based navigation —
// no react-router-dom dependency, so this module can be mounted as-is
// inside any host app (e.g. <DeliveryModule /> rendered at a route).
//
// To use this module, import it once in your app, e.g.:
//   import DeliveryModule from "./DeliveryModule";
//   <DeliveryModule />
//
// FONT NOTE: This module's CSS files reference "Sora", "Inter", and
// "JetBrains Mono". Add the following to your public/index.html <head>
// (or import via @import in your global CSS) so they render correctly:
//
// <link rel="preconnect" href="https://fonts.googleapis.com">
// <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
// <link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">

import "./styles/dashboard.css";
import "./styles/navbar.css";
import "./styles/orders.css";
import "./styles/profile.css";
import "./styles/sidebar.css";
import "./styles/status.css";

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import AssignedOrders from "./pages/AssignedOrders";
import DeliveryProfile from "./pages/DeliveryProfile";
import UpdateStatus from "./pages/UpdateStatus";
import { fetchDeliveryProfile, setAvailability } from "./services/deliveryApi";

const DeliveryModule = () => {
  // Which page is currently visible: "dashboard" | "orders" | "status" | "profile"
  const [activePage, setActivePage] = useState("dashboard");

  // Controls the off-canvas Sidebar on mobile/tablet.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // When navigating to Update Status from an OrderCard's "Update Status"
  // button, this holds the order id to pre-select on that page.
  const [pendingOrderId, setPendingOrderId] = useState(null);

  // Navbar needs partner name/photo/availability — loaded once here so
  // both Navbar and the availability toggle share a single source of truth.
  const [navProfile, setNavProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchDeliveryProfile().then((data) => {
      if (isMounted) setNavProfile(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Called by OrderCard's "View Details" button (wired through the pages).
  // Kept simple here: jumps to the orders page; a fuller app could open
  // a details modal/drawer instead.
  const handleViewOrderDetails = (orderId) => {
    setActivePage("orders");
    // eslint-disable-next-line no-console
    console.log("View details requested for:", orderId);
  };

  // Called by OrderCard's "Update Status" button — navigates to the
  // Update Status page with that order pre-selected.
  const handleUpdateOrderStatus = (orderId) => {
    setPendingOrderId(orderId);
    setActivePage("status");
  };

  // Flips the partner's availability and reflects it instantly in the Navbar.
  const handleToggleAvailability = async () => {
    if (!navProfile) return;
    const next = navProfile.availability === "Online" ? "Offline" : "Online";
    const updated = await setAvailability(next);
    setNavProfile(updated);
  };

  // Renders whichever page is active. Each page receives only the
  // callbacks/props it actually needs.
  const renderActivePage = () => {
    switch (activePage) {
      case "orders":
        return (
          <AssignedOrders
            onViewOrderDetails={handleViewOrderDetails}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        );
      case "status":
        return <UpdateStatus initialOrderId={pendingOrderId} />;
      case "profile":
        return <DeliveryProfile />;
      case "dashboard":
      default:
        return (
          <DeliveryDashboard
            onViewOrderDetails={handleViewOrderDetails}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        );
    }
  };

  return (
    <div style={{ backgroundColor: "#F5F7FA", minHeight: "100vh" }}>
      <Navbar
        partnerName={navProfile?.name || ""}
        photoUrl={navProfile?.photoUrl || ""}
        availability={navProfile?.availability || "Offline"}
        onToggleAvailability={handleToggleAvailability}
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <div style={{ display: "flex" }}>
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main content area takes the remaining width next to the sidebar */}
        <main style={{ flex: 1, minWidth: 0 }}>{renderActivePage()}</main>
      </div>
    </div>
  );
};

export default DeliveryModule;