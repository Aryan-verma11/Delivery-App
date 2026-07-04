// src/services/deliveryApi.js
//
// Mock "API" layer for the Delivery Module.
// In a real app these functions would call axios/fetch against the
// Express backend. For now they return dummy JSON data, wrapped in
// Promises, so the rest of the app can already be written against
// an async API shape and swapped over later with zero changes.

// ---------------------------------------------------------------------------
// DUMMY DATA
// ---------------------------------------------------------------------------

// The logged-in delivery partner's profile information.

const API = "http://localhost:5000"; // Backend API base URL

const deliveryProfile = {
  id: "DP-1042",
  name: "Himanshu Jhangra",
  email: "himanshu.jhangra@fooddelivery.com",
  phone: "+91 98765 43210",
  vehicleType: "Motorcycle",
  vehicleNumber: "UP32 AB 4521",
  availability: "Online", // "Online" | "Offline"
  photoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8uQdnY6uBGjvzt7IdbOUOcXzf6hfQLi2CKADQYI78PA&s",
  rating: 4.8,
  totalDeliveries: 370,
  joinedOn: "2023-02-14",
};

// ---------------------------------------------------------------------------
// Helper: simulate network latency so loading states feel real.
// ---------------------------------------------------------------------------
const withDelay = (data, ms = 400) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

/**
 * Fetch every order assigned to the current delivery partner.
 * Returns a fresh array copy each time so callers can mutate
 * their local state safely without touching the "source" data.
 */

export const fetchAssignedOrders = async () => {
  const response = await fetch(`${API}/orders`);
  const data = await response.json();

  return data.map(order => ({
    orderId: order.orderId,
    customerName: order.customerName,
    restaurantName: order.restaurantName,
    deliveryAddress: order.deliveryAddress,
    phoneNumber: order.phoneNumber,
    amount: Number(order.amount),
    status: order.status,
    placedAt: order.placedAt,
    items: [],
  }));
};

/**
 * Fetch a single order by its orderId.
 */
export const fetchOrderById = async (orderId) => {
  const response = await fetch(`${API}/orders/${orderId}`);
  return await response.json();
};

/**
 * Fetch the delivery partner's profile.
 */
export const fetchDeliveryProfile = async () => {
  const response = await fetch(`${API}/partners`);
  const data = await response.json();

  const partner = data[0];

  return {
    id: partner.display_code,
    name: partner.full_name,
    email: partner.email,
    phone: partner.phone_number,
    vehicleType: partner.vehicle_type,
    vehicleNumber: partner.vehicle_number,
    availability: partner.availability,
    photoUrl: partner.photo_url,
    rating: Number(partner.rating),
    totalDeliveries: partner.total_deliveries,
    joinedOn: partner.joined_on,
  };
};

/**
 * Update an order's status (e.g. from the Update Status page).
 * Mutates the in-memory dummy array so the change is reflected
 * across the dashboard/orders list during this session.
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  const response = await fetch(
    `${API}/orders/${orderId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    }
  );

  return await response.json();
};
/**
 * Update the delivery partner's profile fields (e.g. from Edit Profile).
 */
export const updateDeliveryProfile = (updatedFields) => {
  Object.assign(deliveryProfile, updatedFields);
  return withDelay({ ...deliveryProfile });
};

/**
 * Toggle / set the partner's online-offline availability.
 */
export const setAvailability = (status) => {
  deliveryProfile.availability = status;
  return withDelay({ ...deliveryProfile });
};

/**
 * Derive dashboard statistics from the current orders list.
 * Computed on demand instead of stored, so it always matches
 * the live state of assignedOrders.
 */
export const fetchDashboardStats = async () => {
  const response = await fetch(`${API}/dashboard`);
  return await response.json();
};

// Status options used by the Update Status dropdown — exported so the
// dropdown and any status badge logic always stay in sync with this list.
export const STATUS_OPTIONS = [
  "Assigned",
  "Picked Up",
  "Out for Delivery",
  "Delivered",
];