# ⛟ Home delivery— Delivery Module

> **Food Delivery System | Full Stack Project**
> Built with React.js · Node.js · Express.js · PostgreSQL

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Database Setup](#-database-setup)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [Running the Project](#-running-the-project)
- [API Endpoints](#-api-endpoints)
- [Pages & Components](#-pages--components)
- [Screenshots](#-screenshots)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)

---

## 📌 Project Overview

**Home delivery Delivery Module** is the delivery partner-facing dashboard of a larger Food Delivery System. It allows a delivery partner to:

- View their delivery dashboard with live stats
- See all orders assigned to them
- Update the delivery status of each order
- Manage their personal profile and vehicle info
- Toggle their availability (Online / Offline)

This module is **Member 8's responsibility** in the group project and is built as a standalone React module that plugs into the shared system.

---

## 🛠 Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| Frontend    | React.js 19, CSS3 (no UI library)    |
| Backend     | Node.js, Express.js 4                |
| Database    | PostgreSQL 15+                       |
| DB Driver   | node-postgres (`pg`)                 |
| Fonts       | Sora · Inter · JetBrains Mono (Google Fonts) |

---

## ✨ Features

### 🏠 Delivery Dashboard
- Personalized welcome card with partner name, rating, and lifetime trip count
- 4 live stat tiles: Total Assigned · Pending · Completed · Today's Deliveries
- Recent assigned orders preview

### 📦 Assigned Orders
- Full list of all orders assigned to the delivery partner
- Filter by status: All · Assigned · Picked Up · Out for Delivery · Delivered
- Search by customer name or Order ID
- Courier-ticket style order cards with tear-line design

### 👤 Delivery Profile
- Profile photo, name, rating, join date
- Contact details: email, phone
- Vehicle info: type and number plate
- Online / Offline availability indicator
- Edit Profile modal (updates live to DB)

### 🔄 Update Delivery Status
- Dropdown to pick an order
- Visual progress stepper: Assigned → Picked Up → Out for Delivery → Delivered
- Success banner after update
- Changes are persisted to PostgreSQL and auto-logged in status history table

---

## 📁 Project Structure

```
delivery-app/
│
├── public/
│   └── index.html                  ← Add Google Fonts <link> tags here
│
├── src/
│   ├── DeliveryModule.jsx          ← Main shell (navigation + state)
│   ├── App.js                      ← Mounts DeliveryModule
│   │
│   ├── components/
│   │   ├── Navbar.jsx              ← Top bar with brand + availability toggle
│   │   ├── Sidebar.jsx             ← Left nav with 4 page links
│   │   ├── OrderCard.jsx           ← Courier-ticket style order card
│   │   ├── StatsCard.jsx           ← Dashboard stat tile
│   │   └── StatusBadge.jsx         ← Colored pill badge for order status
│   │
│   ├── pages/
│   │   ├── DeliveryDashboard.jsx   ← Dashboard page
│   │   ├── AssignedOrders.jsx      ← Orders list with filter + search
│   │   ├── DeliveryProfile.jsx     ← Profile page with edit modal
│   │   └── UpdateStatus.jsx        ← Status updater with stepper
│   │
│   ├── styles/
│   │   ├── dashboard.css           ← Dashboard + shared card styles
│   │   ├── orders.css              ← Orders page layout + filter bar
│   │   ├── profile.css             ← Profile page + edit modal
│   │   ├── status.css              ← Status page + stepper
│   │   ├── navbar.css              ← Navbar styles
│   │   └── sidebar.css             ← Sidebar + mobile drawer styles
│   │
│   └── services/
│       └── deliveryApi.js          ← All API calls to Express backend
│
├── backend/
│   ├── server.js                   ← Express server entry point (port 5000)
│   ├── db.js                       ← PostgreSQL connection pool
│   ├── package.json                ← Backend dependencies
│   ├── .env                        ← DB credentials (never commit this)
│   └── routes/
│       └── delivery.js             ← All /api/delivery/* route handlers
│
└── delivery_module_schema.sql      ← PostgreSQL schema + seed data
```

---

## ✅ Prerequisites

Make sure the following are installed on your machine before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | Comes with Node.js |
| PostgreSQL | v14+ | https://www.postgresql.org/download |
| Git | Any | https://git-scm.com |

Verify your installations:

```bash
node --version
npm --version
psql --version
```

---

## 🗄 Database Setup

### 1. Open PostgreSQL terminal

```bash
psql -U postgres
```

### 2. Create the database

```sql
CREATE DATABASE delivery_app;
\q
```

### 3. Run the schema file

This creates all tables, triggers, indexes, and inserts seed data (the 6 sample orders + 1 delivery partner):

```bash
psql -U postgres -d delivery_app -f delivery_module_schema.sql
```

### 4. Verify the data was inserted

```bash
psql -U postgres -d delivery_app
```

```sql
SELECT display_code, full_name, availability FROM delivery_partners;
SELECT order_id, customer_name, status FROM delivery_assignments;
\q
```

You should see **1 partner (Arjun Mehta)** and **6 orders**.

### Tables Created

| Table | Purpose |
|-------|---------|
| `delivery_partners` | Delivery partner profiles |
| `delivery_assignments` | Orders assigned to a partner |
| `delivery_status_history` | Audit log of every status change |

---

## ⚙️ Backend Setup

### 1. Navigate to the backend folder

```bash
cd delivery-app/backend
```

### 2. Install dependencies

```bash
npm install
```

This installs: `express` · `pg` · `cors` · `dotenv` · `nodemon`

### 3. Configure environment variables

Open `backend/.env` and fill in your PostgreSQL password:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=delivery_app
DB_USER=postgres
DB_PASSWORD=your_password_here
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
```

> ⚠️ **Never commit the `.env` file to Git.** It is already listed in `.gitignore`.

---

## 💻 Frontend Setup

### 1. Navigate to the React project root

```bash
cd delivery-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add Google Fonts to `public/index.html`

Open `public/index.html` and paste these three lines inside the `<head>` tag:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
```

### 4. Confirm `src/services/deliveryApi.js` points to the backend

The file should have this at the top:

```js
const BASE_URL = "http://localhost:5000/api/delivery";
```

This means the React app calls your Express server, which in turn reads from PostgreSQL. The dummy JSON is no longer used.

---

## 🚀 Running the Project

You need **two terminals open at the same time**.

### Terminal 1 — Start the Backend

```bash
cd delivery-app/backend
npm run dev
```

Expected output:
```
✅  Delivery Module API running at http://localhost:5000
    Health check: http://localhost:5000/api/health
```

### Terminal 2 — Start the Frontend

```bash
cd delivery-app
npm start
```

Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

### Verify the connection

Open this in your browser — it confirms Express can reach PostgreSQL:

```
http://localhost:5000/api/health
```

Response should be:
```json
{ "status": "ok", "db": "connected" }
```

Then open your app at:
```
http://localhost:3000
```

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api/delivery` and served from `http://localhost:5000`.

| Method | Endpoint | Description | Used By |
|--------|----------|-------------|---------|
| `GET` | `/api/health` | Check server + DB connection | Debugging |
| `GET` | `/api/delivery/profile` | Get partner profile | Profile page, Navbar |
| `PUT` | `/api/delivery/profile` | Update name, phone, vehicle | Edit Profile modal |
| `PATCH` | `/api/delivery/profile/availability` | Toggle Online/Offline | Navbar toggle |
| `GET` | `/api/delivery/orders` | Get all assigned orders | Assigned Orders, Dashboard |
| `GET` | `/api/delivery/orders/:orderId` | Get one order by ID | Order detail |
| `PATCH` | `/api/delivery/orders/:orderId/status` | Update order status | Update Status page |
| `GET` | `/api/delivery/stats` | Get dashboard stat numbers | Dashboard tiles |

### Example Request — Update Status

```bash
curl -X PATCH http://localhost:5000/api/delivery/orders/7841/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "Delivered" }'
```

---

## 🧩 Pages & Components

### Pages

| Page | File | Route Key |
|------|------|-----------|
| Dashboard | `pages/DeliveryDashboard.jsx` | `dashboard` |
| Assigned Orders | `pages/AssignedOrders.jsx` | `orders` |
| Update Status | `pages/UpdateStatus.jsx` | `status` |
| Delivery Profile | `pages/DeliveryProfile.jsx` | `profile` |

### Components

| Component | Purpose |
|-----------|---------|
| `Navbar.jsx` | Top bar — brand, availability toggle, avatar |
| `Sidebar.jsx` | Left nav — page links, active indicator, mobile drawer |
| `OrderCard.jsx` | Courier-ticket style order card with tear-line divider |
| `StatsCard.jsx` | Single stat tile (icon + number + label + accent bar) |
| `StatusBadge.jsx` | Colored pill badge showing delivery status |

---

## 🖼 Screenshots

| Page | Description |
|------|-------------|
| Dashboard | Welcome card + 4 stat tiles + recent orders |
| Assigned Orders | Full order list with filter chips + search bar |
| Update Status | Order picker + progress stepper + dropdown |
| Profile | Identity card + details card + edit modal |

> To preview the UI without any setup, open `delivery-module-preview.html`
> directly in your browser — it runs entirely from a single file using
> React loaded from CDN, no installation needed.

---

## 🔐 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `delivery_app` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | *(required)* | Database password |
| `PORT` | `5000` | Express server port |
| `CLIENT_ORIGIN` | `http://localhost:3000` | React app URL (for CORS) |

---

## 🐛 Troubleshooting

### ❌ `psql: command not found`
PostgreSQL is not in your PATH. Add it:
- **Windows:** Add `C:\Program Files\PostgreSQL\15\bin` to System Environment Variables → Path
- **Mac:** Run `export PATH=$PATH:/Library/PostgreSQL/15/bin` in terminal

### ❌ `password authentication failed for user "postgres"`
Wrong password in your `.env` file. Reset it in psql:
```sql
ALTER USER postgres WITH PASSWORD 'newpassword';
```

### ❌ `Cannot find module './components/Navbar'`
You haven't copied the component files into `src/components/`. Make sure all 14 files are placed in the correct folders as shown in the Project Structure above.

### ❌ `Access to fetch blocked by CORS`
Your `CLIENT_ORIGIN` in `backend/.env` doesn't match where React is running. Set it to `http://localhost:3000` and restart the backend.

### ❌ `relation "delivery_partners" does not exist`
The schema SQL file was not run. Go back to the **Database Setup** step and run:
```bash
psql -U postgres -d delivery_app -f delivery_module_schema.sql
```

### ❌ Frontend shows blank / loading forever
The backend is not running. Open Terminal 1 and run `npm run dev` inside the `backend/` folder.

---

## 👨‍💻 Author

**Member 8 — Delivery Module**
Food Delivery System | Group Project

---

## 📄 License

This project is built for academic purposes as part of a group assignment.
