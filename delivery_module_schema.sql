-- =============================================================
-- delivery_module_schema.sql
--
-- PostgreSQL schema for Member 8 — Delivery Module.
--
-- SCOPE NOTE: This file only defines tables owned by the Delivery
-- Module (delivery partners, their order assignments, and status
-- history). It assumes the core "orders", "customers", and
-- "restaurants" tables already exist elsewhere in the shared
-- database (created by the members responsible for those modules).
-- The foreign key on delivery_assignments.order_id is written
-- against an `orders(id)` table — adjust the type/name if your
-- team's actual orders table differs.
--
-- Run with:  psql -U <user> -d <database> -f delivery_module_schema.sql
-- =============================================================

-- -------------------------------------------------------------
-- Extension needed for gen_random_uuid() (used for primary keys).
-- Skip this if your team already uses plain SERIAL ids elsewhere —
-- in that case swap the UUID columns below for SERIAL/BIGSERIAL.
-- -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------
-- ENUM: delivery_status
-- Matches the dropdown options on the Update Delivery Status page.
-- Using an ENUM (instead of free-text) guarantees the database
-- only ever stores one of these four exact values.
-- -------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_status') THEN
        CREATE TYPE delivery_status AS ENUM (
            'Assigned',
            'Picked Up',
            'Out for Delivery',
            'Delivered'
        );
    END IF;
END$$;

-- ENUM: availability status for a delivery partner (Navbar toggle / Profile page)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_availability') THEN
        CREATE TYPE partner_availability AS ENUM ('Online', 'Offline');
    END IF;
END$$;

-- ENUM: vehicle type, used on the Profile / Edit Profile form
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type') THEN
        CREATE TYPE vehicle_type AS ENUM ('Motorcycle', 'Scooter', 'Bicycle', 'Car');
    END IF;
END$$;

-- =============================================================
-- TABLE: delivery_partners
-- One row per delivery partner. Backs the Delivery Profile page.
-- =============================================================
CREATE TABLE IF NOT EXISTS delivery_partners (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_code      VARCHAR(20) UNIQUE NOT NULL,       -- e.g. "DP-1042", shown on the Profile page
    full_name         VARCHAR(120) NOT NULL,
    email             VARCHAR(150) UNIQUE NOT NULL,
    phone_number      VARCHAR(20) NOT NULL,
    password_hash     VARCHAR(255) NOT NULL,             -- store a bcrypt hash, never plain text
    vehicle_type      vehicle_type NOT NULL DEFAULT 'Motorcycle',
    vehicle_number    VARCHAR(30) NOT NULL,
    availability      partner_availability NOT NULL DEFAULT 'Offline',
    photo_url         TEXT,
    rating             NUMERIC(2,1) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    total_deliveries  INTEGER NOT NULL DEFAULT 0,
    joined_on         DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE delivery_partners IS 'Delivery partner accounts and profile info shown on the Delivery Profile page.';

-- =============================================================
-- TABLE: delivery_assignments
-- One row per order assigned to a delivery partner. Backs the
-- Assigned Orders page and the Update Delivery Status page.
--
-- NOTE: order_id references the shared "orders" table (owned by
-- another module). customer_name/restaurant_name/delivery_address/
-- customer_phone/order_amount are denormalized copies here so the
-- Delivery Module's queries are fast and self-contained without
-- needing a join across every team's table on every page load —
-- they should be populated at assignment time from the orders table.
-- =============================================================
CREATE TABLE IF NOT EXISTS delivery_assignments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            BIGINT NOT NULL,                  -- FK -> orders(id), see note above
    delivery_partner_id UUID NOT NULL REFERENCES delivery_partners(id) ON DELETE CASCADE,

    -- Denormalized order-display fields (see NOTE above)
    customer_name       VARCHAR(120) NOT NULL,
    restaurant_name     VARCHAR(120) NOT NULL,
    delivery_address    TEXT NOT NULL,
    customer_phone      VARCHAR(20) NOT NULL,
    order_amount        NUMERIC(10,2) NOT NULL CHECK (order_amount >= 0),

    status              delivery_status NOT NULL DEFAULT 'Assigned',

    assigned_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    picked_up_at        TIMESTAMPTZ,
    out_for_delivery_at TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE delivery_assignments IS 'Orders assigned to a delivery partner, with current status. Backs Dashboard + Assigned Orders + Update Status pages.';

-- Index to quickly fetch "my assigned orders" (Assigned Orders page query)
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_partner
    ON delivery_assignments (delivery_partner_id);

-- Index to quickly filter by status (the filter chips on Assigned Orders page)
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_status
    ON delivery_assignments (status);

-- Index to quickly compute "Today's Deliveries" stat on the Dashboard
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_assigned_at
    ON delivery_assignments (assigned_at);

-- =============================================================
-- TABLE: delivery_status_history
-- Append-only audit trail: every status change made on the
-- Update Delivery Status page gets logged here, so you can show
-- a timeline later or debug "who changed what, when."
-- =============================================================
CREATE TABLE IF NOT EXISTS delivery_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id   UUID NOT NULL REFERENCES delivery_assignments(id) ON DELETE CASCADE,
    old_status      delivery_status,
    new_status      delivery_status NOT NULL,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE delivery_status_history IS 'Audit log of every status change for an assignment.';

CREATE INDEX IF NOT EXISTS idx_status_history_assignment
    ON delivery_status_history (assignment_id);

-- =============================================================
-- TRIGGER: auto-update `updated_at` on row changes
-- Keeps updated_at accurate without every API call having to set it.
-- =============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_delivery_partners_updated_at ON delivery_partners;
CREATE TRIGGER trg_delivery_partners_updated_at
    BEFORE UPDATE ON delivery_partners
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_delivery_assignments_updated_at ON delivery_assignments;
CREATE TRIGGER trg_delivery_assignments_updated_at
    BEFORE UPDATE ON delivery_assignments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
-- TRIGGER: log status changes into delivery_status_history
-- Fires automatically whenever delivery_assignments.status changes,
-- and also stamps the matching timestamp column (picked_up_at,
-- out_for_delivery_at, delivered_at).
-- =============================================================
CREATE OR REPLACE FUNCTION log_delivery_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO delivery_status_history (assignment_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);

        IF NEW.status = 'Picked Up' THEN
            NEW.picked_up_at = now();
        ELSIF NEW.status = 'Out for Delivery' THEN
            NEW.out_for_delivery_at = now();
        ELSIF NEW.status = 'Delivered' THEN
            NEW.delivered_at = now();
            NEW.delivery_partner_id = NEW.delivery_partner_id; -- no-op, keeps linter quiet
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_status_change ON delivery_assignments;
CREATE TRIGGER trg_log_status_change
    BEFORE UPDATE ON delivery_assignments
    FOR EACH ROW EXECUTE FUNCTION log_delivery_status_change();

-- =============================================================
-- SEED DATA — matches the dummy JSON used in the React frontend,
-- so the database and the UI mock data tell the same story.
-- =============================================================

INSERT INTO delivery_partners
    (display_code, full_name, email, phone_number, password_hash, vehicle_type, vehicle_number, availability, photo_url, rating, total_deliveries, joined_on)
VALUES
    ('DP-1042', 'Arjun Mehta', 'arjun.mehta@swiftdrop.com', '+91 98765 43210', '$2b$12$replace_with_real_bcrypt_hash', 'Motorcycle', 'UP32 AB 4521', 'Online', 'https://i.pravatar.cc/150?img=12', 4.8, 312, '2023-02-14')
ON CONFLICT (display_code) DO NOTHING;

-- Grab the partner's id for the assignment inserts below.
DO $$
DECLARE
    v_partner_id UUID;
BEGIN
    SELECT id INTO v_partner_id FROM delivery_partners WHERE display_code = 'DP-1042';

    INSERT INTO delivery_assignments
        (order_id, delivery_partner_id, customer_name, restaurant_name, delivery_address, customer_phone, order_amount, status, assigned_at)
    VALUES
        (7841, v_partner_id, 'Priya Sharma', 'Spice Junction', '12B, Sector 18, Noida, UP', '+91 90123 45678', 540.00, 'Out for Delivery', now() - interval '2 hours'),
        (7842, v_partner_id, 'Rohit Verma',  'Burger Barn',     '44, MG Road, Lucknow, UP', '+91 91234 56789', 320.00, 'Picked Up',        now() - interval '1 hour 40 minutes'),
        (7843, v_partner_id, 'Anita Desai',  'Green Bowl Cafe', '7, Park Street, Lucknow, UP', '+91 92345 67890', 410.00, 'Assigned',        now() - interval '1 hour 15 minutes'),
        (7844, v_partner_id, 'Karan Singh',  'Punjabi Tadka',   '21, Hazratganj, Lucknow, UP', '+91 93456 78901', 690.00, 'Delivered',       now() - interval '1 day'),
        (7845, v_partner_id, 'Neha Kapoor',  'Sushi Stop',      '3, Gomti Nagar, Lucknow, UP', '+91 94567 89012', 875.00, 'Delivered',       now() - interval '2 days'),
        (7846, v_partner_id, 'Vikram Rao',   'Spice Junction',  '9, Indira Nagar, Lucknow, UP', '+91 95678 90123', 260.00, 'Assigned',        now() - interval '40 minutes')
    ON CONFLICT DO NOTHING;
END$$;

-- =============================================================
-- HANDY QUERIES (reference only — these map directly to the
-- frontend pages and dummy API functions you already built)
-- =============================================================

-- Dashboard stats (mirrors fetchDashboardStats in deliveryApi.js)
-- SELECT
--     COUNT(*)                                         AS total_assigned,
--     COUNT(*) FILTER (WHERE status <> 'Delivered')     AS pending_deliveries,
--     COUNT(*) FILTER (WHERE status = 'Delivered')      AS completed_deliveries,
--     COUNT(*) FILTER (WHERE assigned_at::date = CURRENT_DATE) AS todays_deliveries
-- FROM delivery_assignments
-- WHERE delivery_partner_id = :partner_id;

-- Assigned Orders list, newest first (mirrors fetchAssignedOrders)
-- SELECT * FROM delivery_assignments
-- WHERE delivery_partner_id = :partner_id
-- ORDER BY assigned_at DESC;

-- Update status (mirrors updateOrderStatus)
-- UPDATE delivery_assignments
-- SET status = :new_status
-- WHERE id = :assignment_id;
