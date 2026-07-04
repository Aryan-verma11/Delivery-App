// src/components/OrderCard.jsx
//
// The module's signature visual element: each assigned order is
// rendered as a "courier route ticket" — a dashed tear-line divides
// the order summary from the action stub, echoing a real handheld
// delivery slip rather than a generic dashboard card.

import React from "react";
import StatusBadge from "./StatusBadge";

/**
 * OrderCard
 * @param {object} order            - one order object from deliveryApi
 * @param {function} onViewDetails  - called with order.orderId
 * @param {function} onUpdateStatus - called with order.orderId
 */
const OrderCard = ({ order, onViewDetails, onUpdateStatus }) => {
  const {
    orderId,
    customerName,
    restaurantName,
    deliveryAddress,
    phoneNumber,
    amount,
    status,
  } = order;

  return (
    <article className="order-ticket">
      {/* ---------- Ticket header: order id + status stamp ---------- */}
      <div className="order-ticket__header">
        <span className="order-ticket__id">#{orderId}</span>
        <StatusBadge status={status} />
      </div>

      {/* ---------- Ticket body: customer + restaurant + address ---------- */}
      <div className="order-ticket__body">
        <div className="order-ticket__row">
          <span className="order-ticket__field-label">Customer: </span>
          <span className="order-ticket__field-value">{customerName}</span>
        </div>

        <div className="order-ticket__row">
          <span className="order-ticket__field-label">Restaurant: </span>
          <span className="order-ticket__field-value">{restaurantName}</span>
        </div>

        <div className="order-ticket__row">
          <span className="order-ticket__field-label">Deliver to: </span>
          <span className="order-ticket__field-value">{deliveryAddress}</span>
        </div>

        <div className="order-ticket__row">
          <span className="order-ticket__field-label">Phone: </span>
          <span className="order-ticket__field-value order-ticket__mono">
            {phoneNumber}
          </span>
        </div>
      </div>

      {/* ---------- Tear line: the "rip here" visual divider ---------- */}
      <div className="order-ticket__tear" aria-hidden="true">
        <span className="order-ticket__notch order-ticket__notch--left" />
        <span className="order-ticket__dashes" />
        <span className="order-ticket__notch order-ticket__notch--right" />
      </div>

      {/* ---------- Ticket stub: amount + actions ---------- */}
      <div className="order-ticket__stub">
        <div className="order-ticket__amount">
          <span className="order-ticket__field-label">Amount: </span>
          <span className="order-ticket__amount-value">
            ₹{amount.toFixed(2)}
          </span>
        </div>

        <div className="order-ticket__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => onViewDetails(orderId)}
          >
            View Details
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onUpdateStatus(orderId)}
          >
            Update Status
          </button>
        </div>
      </div>
    </article>
  );
};

<div className="order-actions">
    <button className="view-btn">
        👁 View Details
    </button>

    <button className="update-btn">
        🚚 Update Status
    </button>
</div>

export default OrderCard;