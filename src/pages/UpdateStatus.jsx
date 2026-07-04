import React, { useEffect, useState } from "react";
import {
  fetchAssignedOrders,
  updateOrderStatus,
  STATUS_OPTIONS,
} from "../services/deliveryApi";

const UpdateStatus = ({ initialOrderId }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(initialOrderId || "");
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await fetchAssignedOrders();
    setOrders(data);
  };

  const handleUpdate = async () => {
  if (!selectedOrder || !status) {
    alert("Select order and status");
    return;
  }

  try {
    await updateOrderStatus(selectedOrder, status);

    alert("Status Updated Successfully");

    setStatus("");
    setSelectedOrder("");

    await loadOrders();
  } catch (err) {
    console.error(err);
    alert("Failed to update status");
  };

    await updateOrderStatus(selectedOrder, status);

    alert("Status Updated Successfully");

    loadOrders();
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Update Order Status</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>Order</label>
        <br />
        <select
          value={selectedOrder}
          onChange={(e) => setSelectedOrder(e.target.value)}
        >
          <option value="">Select Order</option>

          {orders.map((order) => (
            <option key={order.orderId} value={order.orderId}>
              {order.orderId} - {order.customerName}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Status</label>
        <br />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Select Status</option>

          {STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleUpdate}>Update Status</button>
    </div>
  );
};

export default UpdateStatus;