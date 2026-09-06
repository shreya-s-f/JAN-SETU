# 🇮🇳 JANSETU
> **"Your Voice. Your City. Your JanSetu."**
> A Smart Civic Issue Reporting, Tracking, Community Verification & City Improvement Platform for Indian Cities.

---

## 🌟 Quick Start

You can run JanSetu in two ways:

### Option 1: Full-Stack Mode with Backend API (Recommended)
JanSetu includes a zero-dependency Node.js HTTP and REST API server.
```bash
# Inside the d:\JAN SETU directory:
node server.js
# OR double-click start.bat on Windows
```
Open your browser at: **`http://localhost:3000`**

### Option 2: Pure Frontend Offline Mode
Simply double click `index.html` in your browser. JanSetu operates with full functionality using browser `localStorage`!

---

## 🔑 Demo Login Accounts

Quick 1-Click login buttons are available on `login.html`:

| Role | User Name | Email | Password | Primary Locality |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen** | Rajesh Kumar | `citizen@jansetu.in` | `citizen123` | Bengaluru (Ward 150 - Indiranagar) |
| **Admin** | Priya Sharma (IAS) | `admin@jansetu.in` | `admin123` | Municipal Corporation HQ |
| **Field Worker** | Suresh Patil | `worker@jansetu.in` | `worker123` | Roads & Infrastructure (Ward 150 Lead) |

---

## 🚀 Key Features

1. **Civic Priority Score (0–100)**: Multi-factor algorithm considering severity, people affected, upvotes, age penalty, and emergency level.
2. **Multi-Step Report Issue Wizard**: 7-step wizard with HTML5 Geolocation API, photo upload with preview, duplicate proximity detection, and impact rating.
3. **Duplicate Issue Detection**: Analyzes keyword overlap and spatial proximity ($\le 1.5$ km) to alert citizens and encourage supporting existing issues.
4. **Interactive Before / After Resolution Proof**: Touch and mouse comparison slider displaying audited photo proof of completed field resolutions.
5. **Interactive City Map & Problem Heatmap**: Leaflet.js + OpenStreetMap with color-coded markers and toggleable density heat zones.
6. **Simulated Email Notification Engine**: `emailService.js` logs all outbound email events into storage and provides an in-app interactive modal email inspector.
7. **Role-Based Portals**: Distinct dashboards and toolsets for Citizens, Municipal Admins, and Field Workers.
8. **Public Transparency & Analytics**: Department performance scorecards, ward civic health ratings, and Chart.js telemetry.

---

## 📡 Backend REST API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server health check and database statistics |
| `POST` | `/api/auth/login` | Authenticate citizen, admin, or worker |
| `POST` | `/api/auth/register` | Register citizen with welcome points |
| `GET` | `/api/complaints` | Filter and retrieve civic complaints |
| `POST` | `/api/complaints` | Submit new complaint with auto-priority score |
| `GET` | `/api/complaints/:id` | Retrieve single complaint timeline |
| `POST` | `/api/complaints/:id/upvote` | Community upvote endpoint |
| `POST` | `/api/complaints/:id/verify` | Ground verification ("still_present" / "resolved") |
| `PUT` | `/api/complaints/:id/status` | Admin status update, assignment, or escalation |
| `GET` | `/api/workers` | Retrieve municipal field squads |
| `GET` | `/api/departments` | Retrieve municipal division scorecards |
| `GET` | `/api/emails` | Retrieve outbound simulated email audit logs |
| `POST` | `/api/reset` | Reset database to pristine 22-complaint seed state |

---

## 🛠️ Technology Stack
- **Frontend**: HTML5, CSS3 Custom Design System (CSS Variables, Glassmorphism, Dark/Light Themes), Vanilla JavaScript ES6+
- **Backend**: Node.js built-in `http`, `fs`, `path`, `url` (Zero npm dependencies required)
- **Maps**: Leaflet.js 1.9.4 & OpenStreetMap CartoDB
- **Visualizations**: Chart.js 4.4.1
- **Icons & Fonts**: Font Awesome 6.5, Plus Jakarta Sans, Space Grotesk
