# FleetFlow - Advanced Fleet Management System 🚛

[![Video Demo](https://img.shields.io/badge/YouTube-Video_Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/Kuup19EGZNU)

**FleetFlow** is a comprehensive, full-stack logistics and fleet management platform built using the MERN stack (MongoDB, Express, React, Node.js). It provides a high-performance, visually stunning interface for managing drivers, vehicles, maintenance operations, route dispatching, and high-level financial analytics. 

Designed with modern UI/UX principles, FleetFlow incorporates glassmorphism aesthetics, advanced charting (Recharts), fluid animations (GSAP), and interactive maps (Leaflet) to deliver a premium command-center experience.

---

## 🚀 Key Features

### 🛡️ Role-Based Access Control (RBAC)
Secure authentication with distinct roles governing module access:
- **Manager**: Global oversight, adding vehicles, managing maintenance, and viewing analytics.
- **Dispatcher**: Creating trips, assigning drivers and vehicles, and interacting with map tools.
- **Safety Officer**: Monitoring driver compliance, license expiries, and safety scores.
- **Financial Analyst**: Accessing revenue data, cost tracking, and comprehensive CSV exports.

### 🖥️ Command Center Dashboard
An "at-a-glance" operational hub displaying real-time Fleet Utilization, Active Trips, Maintenance Alerts, and Pending Cargo in a sleek Magic-Bento grid layout.

### 🗺️ Interactive Trip Dispatcher
Create new logistics routes by mapping Origin and Destination points directly via an interactive **Leaflet map** integration. Includes reverse-geocoding (Nominatim API) to convert map coordinates into human-readable dispatch addresses.

### 📊 Advanced Financial Analytics & Export
Deep-dive into your operational costs and profit margins:
- Side-by-side **Vehicle ROI Analysis** comparing total lifetime costs vs revenue.
- Top Costliest Vehicles and Fuel Efficiency trends.
- **Comprehensive CSV Exports** allowing Financial Analysts and Managers to download KPI summaries, monthly financial breakdowns, and maintenance downtime reports.

### 🔧 Maintenance & Asset Logging
Track vehicle lifespans with odometers, log repairs, and automatically calculate estimated days lost to maintenance downtime. Auto-updates fleet status to "In Shop" when serviced.

### 👨‍✈️ Driver Safety Profiles
Monitor compliance by tracking Driver License expiries, suspending at-risk drivers, and scoring driver performance. Suspended or expired drivers are securely blocked from being dispatched.

---

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (Utility-first styling, Glassmorphism, Dark Neon theme)
- GSAP (Fluid layout and mount animations)
- Recharts (Interactive complex data visualizations)
- React Leaflet (Interactive mapping)
- Zustand (Global state management)

**Backend:**
- Node.js & Express.js (RESTful API architecture)
- MongoDB & Mongoose (Database schemas and validation)
- JSON Web Tokens (JWT Authentication)
- bcryptjs (Password Hashing)

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd FleetFlow
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/fleetflow
   JWT_SECRET=your_secret_key_here
   ```
   Run the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```
   Run the frontend:
   ```bash
   npm run dev
   ```

---

## 🔗 Demo
Watch the full project walkthrough and feature demonstration here:
**[View FleetFlow Demo on YouTube](https://youtu.be/Kuup19EGZNU)**
