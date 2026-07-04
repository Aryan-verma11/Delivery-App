const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "delivery_db",
  password: "arydb",
  port: 5432,
});

module.exports = pool;