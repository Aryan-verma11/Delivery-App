const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.get("/partners", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM delivery_partners");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Database Error");
  }
});

app.get("/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
  order_id AS "orderId",
  customer_name AS "customerName",
  restaurant_name AS "restaurantName",
  delivery_address AS "deliveryAddress",
  customer_phone AS "phoneNumber",
  order_amount AS "amount",
  status AS "status",
  created_at AS "placedAt"
    FROM delivery_assignments
    ORDER BY created_at DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

app.put("/orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `
      UPDATE delivery_assignments
      SET status = $1,
          updated_at = NOW()
      WHERE order_id = $2
      RETURNING *
      `,
      [status, orderId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS "totalAssigned",
        COUNT(*) FILTER (WHERE status != 'Delivered') AS "pendingDeliveries",
        COUNT(*) FILTER (WHERE status = 'Delivered') AS "completedDeliveries",
        COUNT(*) FILTER (
          WHERE DATE(created_at) = CURRENT_DATE
        ) AS "todaysDeliveries"
      FROM delivery_assignments;
    `);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});