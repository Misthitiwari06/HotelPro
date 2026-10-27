# HotelPro — Modern Hotel Management Solution

**HotelPro** is a comprehensive, production-grade hotel management web application designed to streamline hospitality operations. Powered by the **MERN** stack (MongoDB, Express.js, React JSX, Node.js) with **Bootstrap 5** and **JSON Web Token (JWT)** role-based security.

---

## 🌟 Key Features

1. **Role-Based Authentication (JWT & bcrypt)**
   - **Admin / General Manager**: Full administrative authority, revenue & occupancy KPIs, room inventory CRUD.
   - **Front Desk Staff**: Live arrivals & departures dispatch, 1-click check-in/check-out workflow, real-time room housekeeping status toggles (`available`, `occupied`, `cleaning`, `maintenance`).
   - **Guest / Customer**: Search room availability with date ranges, instant booking with simulated payment processing (Card, UPI, Cash), reservation history, and downloadable/printable tax invoices.
   - **1-Click Demo Profile Switcher**: Instantly log in as Admin, Staff, or Guest from anywhere in the navbar or auth modal.

2. **Room & Inventory Management (CRUD)**
   - Categorized room catalog (Single, Double, Deluxe, Executive Suite, Presidential Suite).
   - High-resolution galleries, room capacity, bed configuration, and floor distribution.
   - Dynamic search by room number, keywords, price range, and occupancy capacity.

3. **Intelligent Booking Engine**
   - Dynamic nights & 12% hospitality tax calculation.
   - Date conflict prevention ensuring rooms cannot be double-booked for overlapping periods.
   - Automated status synchronization (booking marked `checked-in` automatically updates room status to `occupied`; `checked-out` updates room status to `cleaning`).

4. **Official Tax Invoices & Billing**
   - Printable luxury tax invoices (`window.print()` and PDF save ready).
   - Unique booking reference numbers (`HP-XXXX-XXXX`), itemized billing breakdown, and transaction logs.

5. **Executive Analytics Dashboard**
   - Live KPI cards: Total Revenue ($), Occupancy Rate (%), In-House Stays, Total Rooms.
   - Room status progress distribution and guest lifetime spend logs.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React (JSX), Bootstrap 5, Bootstrap Icons, Axios, Vite |
| **Backend** | Node.js, Express.js REST API |
| **Database** | MongoDB & Mongoose ODM |
| **Authentication** | JSON Web Token (JWT) with HTTP Bearer Authorization, bcryptjs |
| **Styling & Design** | Responsive CSS3, Google Fonts (*Plus Jakarta Sans* & *Playfair Display*) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v16 or above (Tested on v24)
- **npm**: v8 or above
- **MongoDB**: Local MongoDB on port 27017 or MongoDB Atlas URI

### 2. Running the Servers

The project is structured into `server/` (backend API) and `client/` (React frontend).

#### A. Start Backend Server
```bash
cd server
npm install
node seed/seedData.js    # (Optional) Seed realistic hotel data & demo accounts
npm start               # Runs on http://localhost:5050
```

#### B. Start Frontend Vite Server
```bash
cd client
npm install
npm run dev             # Runs on http://localhost:3000
```

> **Note:** The backend on port `5050` is also pre-configured to statically serve the compiled React frontend directly at `http://localhost:5050`!

---

## 🔑 Default Demo Accounts

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **General Manager (Admin)** | `admin@hotelpro.com` | `admin123` | Full access: Analytics, Room CRUD, Bookings, Guests |
| **Front Desk Lead (Staff)** | `staff@hotelpro.com` | `staff123` | Check-in / check-out, room cleaning toggles, bookings |
| **Valued Guest (Customer)** | `guest@hotelpro.com` | `guest123` | Search, book rooms, view my bookings, print invoices |

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new guest or staff account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `PUT /api/auth/profile` — Update user contact and address details

### Rooms (`/api/rooms`)
- `GET /api/rooms` — Search and filter rooms by type, status, price, and capacity
- `GET /api/rooms/:id` — Get single room details
- `GET /api/rooms/check-availability` — Check available rooms for date range
- `POST /api/rooms` — Create new inventory room (Admin/Staff)
- `PUT /api/rooms/:id` — Update room rates, status, or details (Admin/Staff)
- `DELETE /api/rooms/:id` — Delete a room (Admin only)

### Bookings (`/api/bookings`)
- `POST /api/bookings` — Create a new reservation with conflict validation
- `GET /api/bookings/my-bookings` — List current logged-in guest reservations
- `GET /api/bookings` — List all reservations with search & filters (Admin/Staff)
- `GET /api/bookings/:id` — Get detailed booking with invoice information
- `PUT /api/bookings/:id/status` — Front desk check-in / check-out status update
- `PUT /api/bookings/:id/cancel` — Cancel reservation and issue refund

### Executive Dashboard & Guests
- `GET /api/dashboard/stats` — Live KPI metrics: revenue, occupancy, room status
- `GET /api/guests` — Registered guest registry with stay count and total spend
