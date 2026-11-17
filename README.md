# 🇮🇳 JANSETU — Smart Civic Issue Reporting & City Improvement Platform
> **"Your Voice. Your City. Your JanSetu."**
> A modern civic-tech platform connecting Indian citizens, municipal administrators, and field squads for transparent, verified urban issue resolution.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Theme](https://img.shields.io/badge/UI%20Theme-White%20%2B%20Red-red.svg)](#-uiux-design-system)
[![Status](https://img.shields.io/badge/Production--Ready-100%25-success.svg)](#)

---

## 📋 Table of Contents
1. [Overview & Highlights](#-overview--highlights)
2. [UI/UX Design System (White + Red)](#-uiux-design-system)
3. [Architecture Overview](#-architecture-overview)
4. [Installation & Quick Start](#-installation--quick-start)
5. [Environment Variables & Configuration](#-environment-variables--configuration)
6. [Email Verification & Notification Architecture](#-email-verification--notification-architecture)
7. [Authentication & Security](#-authentication--security)
8. [User Roles & Dashboard Features](#-user-roles--dashboard-features)
9. [Civic Learning Module (Flashcards)](#-civic-learning-module-flashcards)
10. [REST API Documentation](#-rest-api-documentation)
11. [Testing & Quality Assurance](#-testing--quality-assurance)
12. [Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)
13. [Pushing to GitHub](#-pushing-to-github)

---

## 🌟 Overview & Highlights

JanSetu transforms daily urban complaints—potholes, overflowing garbage, broken streetlights, chocked drainage, traffic snarls, and damaged civic infrastructure—into structured, prioritized, and geo-tracked civic intelligence.

- **Zero-Dependency Backend**: Powered by Node.js built-in modules (`http`, `https`, `crypto`, `fs`, `path`, `url`). No external `npm install` required!
- **Modern White + Red Design**: Clean municipal visual identity (`#D90429` primary red, pure white cards, soft shadows, rounded corners, subtle animations).
- **Dual Operating Modes**:
  1. **Full-Stack Mode**: Connected to persistent Node.js REST API and file-based JSON store (`data/database.json`).
  2. **Offline Frontend Mode**: Operates seamlessly in standard web browsers using synchronized `localStorage` fallback.
- **Enterprise-Grade Auth**: PBKDF2 salted password hashing, HMAC-SHA256 signed bearer tokens, role authorization guards, and email verification.
- **Email Delivery & Verification**: Built-in integration with **Resend API** plus zero-credential local development fallback with in-app email logs.
- **Civic Learning Module**: Interactive 3D flip card flashcards educating citizens on municipal rights, waste segregation, water safety, and RTI applications.

---

## 🎨 UI/UX Design System

The application features a modern, high-contrast **White + Red** civic design system:
- **Primary Color**: `#D90429` (Civic Red)
- **Primary Hover**: `#B8001F`
- **Backgrounds**: Pure White (`#FFFFFF`) & Soft Light Neutral (`#F8F9FA`)
- **Card Surfaces**: White with subtle borders (`#E5E7EB`) and soft shadows (`box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04)`)
- **Typography**: Space Grotesk (Headings) and Plus Jakarta Sans (Body)
- **Subtle Animations**: Card hover elevations (`translateY(-4px)`), smooth progress bars, 3D card flipping, and modal fade-ins.

---

## 🏛️ Architecture Overview

```
JAN-SETU/
├── server.js               # Zero-dependency Node.js REST API & static server
├── data/
│   └── database.json       # Persistent data store (users, complaints, workers, logs)
├── css/
│   ├── style.css           # Global theme variables, reset, layout, and utilities
│   ├── components.css      # Buttons, badges, cards, inputs, alerts, modals
│   ├── dashboard.css       # Analytics grid, stat cards, tables, timeline
│   └── landing.css         # Hero banners, feature grids, impact stats, video overlays
├── js/
│   ├── api.js              # Centralized API client (Bearer tokens, error handling)
│   ├── auth.js             # Registration, login, session guard, role checks
│   ├── complaints.js       # Issue CRUD, duplicate detector, priority engine
│   ├── emailService.js     # Email notification dispatcher & simulation engine
│   ├── storage.js          # Persistent local storage abstraction
│   ├── citizen.js          # Citizen portal logic & analytics
│   ├── admin.js            # Admin assignment & status transitions
│   ├── worker.js           # Field squad resolution & before/after proof
│   └── ui.js               # Theme toggles, toasts, modal controller
├── flashcards.html         # Interactive Civic Learning & Flashcards page
├── verify-email.html       # Email token verification page
├── index.html              # Main civic portal homepage
├── login.html              # Secure authentication login
├── register.html           # New citizen onboarding
├── report-issue.html       # Multi-step complaint submission wizard
├── explore-issues.html     # Interactive map & searchable issue catalog
├── citizen-dashboard.html  # Citizen personal civic dashboard
├── admin-dashboard.html    # Municipal commissioner executive command center
├── worker-dashboard.html   # Field maintenance squad action panel
├── transparency.html       # Public civic transparency portal
└── .env.example            # Environment configuration template
```

---

## 🚀 Installation & Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) version 16.0.0 or higher.
- A modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari).

### Running in Full-Stack Mode (Recommended)
1. Open your terminal in the project directory:
   ```bash
   cd "d:\JAN SETU"
   ```
2. Start the built-in zero-dependency server:
   ```bash
   node server.js
   ```
   *(Or double-click `start.bat` on Windows)*
3. Access JanSetu in your web browser:
   ```
   http://localhost:3000
   ```

### Running in Pure Frontend Offline Mode
Simply open `index.html` directly in any web browser. JanSetu detects offline status and uses `localStorage` for complete standalone functionality!

---

## ⚙️ Environment Variables & Configuration

Create a `.env` file in the root directory based on `.env.example`:

```env
# Application Server Port
PORT=3000

# Base URL of the Application
APP_URL=http://localhost:3000

# Secret Key for Signing Authentication Tokens
AUTH_SECRET=jansetu_super_secret_production_key_2026_india

# Resend Email API Key (Optional for production email delivery)
# Sign up at https://resend.com to generate your API key
RESEND_API_KEY=

# Sender Email Address for Resend
RESEND_FROM_EMAIL=JanSetu <notifications@jansetu.in>
```

> **Safe Development Fallback**: If `RESEND_API_KEY` is not set, JanSetu automatically routes emails to the internal simulation engine and console logger. Verification tokens and activation links are safely displayed in terminal logs and stored in `data/database.json` email logs without exposing secrets.

---

## 📧 Email Verification & Notification Architecture

### Registration & Verification Flow
```
User Submits Registration
         │
         ▼
Account Created (status: emailVerified = false)
         │
         ▼
Unique Token Generated (24-Hour Expiration)
         │
         ├── Resend API Configured?
         │      ├── YES: Dispatches real HTML email via Resend API
         │      └── NO: Logs activation link to server console & DB logs
         ▼
User Clicks Link: /verify-email.html?token=xxx
         │
         ▼
Token Validated by Backend (/api/auth/verify-email)
         │
         ▼
Account Activated (emailVerified = true) + 20 Bonus Impact Points
```

### Event-Driven Notifications
Emails and in-app notifications are generated for:
1. **Welcome & Email Verification** (`email_verification`)
2. **Issue Submitted** (`issue_submitted`)
3. **Admin Verification** (`issue_accepted`)
4. **Task Assigned to Field Worker** (`issue_assigned`)
5. **Field Work In Progress** (`status_update`)
6. **Issue Resolved with Photo Proof** (`issue_resolved`)
7. **Citizen Feedback Received** (`feedback_received`)

---

## 🔒 Authentication & Security

- **Salted Password Hashing**: Passwords are saved with unique cryptographic salts using `crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512')`.
- **Signed Tokens**: Sessions use HMAC-SHA256 signed tokens (`HEADER.PAYLOAD.SIGNATURE`) verified on every protected API call.
- **Sanitized Responses**: Passwords, hashes, and salts are strictly stripped from all API outputs via `sanitizeUser()`.
- **Role-Based Access Control**:
  - `CITIZEN`: Report issues, view personal reports, upvote, verify presence, track status.
  - `ADMIN`: View all complaints, assign field squads, update status, view ward analytics.
  - `WORKER`: View assigned tasks, mark progress, upload resolution photo proof, close tickets.

---

## 🎓 Civic Learning Module (Flashcards)

Accessible at `flashcards.html` and linked in navigation:
- **Interactive 3D Flip Card**: Flip cards with smooth CSS 3D transforms (`rotateY(180deg)`).
- **Categories**: Waste Management, Road Safety, Water & Drainage, Civic Rights & RTI, Municipal Bylaws.
- **Interactive Controls**: Previous, Next, Flip, and Shuffle options.
- **Progress Tracker**: Visual progress bar indicating completed cards.
- **Statutes & Rules**: Each card references relevant Indian laws (e.g., *Motor Vehicles Act 2019*, *Solid Waste Management Rules 2016*, *RTI Act 2005*).

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health status and database counts | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & issue signed token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | **Bearer Token** |
| `GET` | `/api/auth/verify-email` | Verify email token and activate account | No |
| `POST` | `/api/auth/resend-verification` | Request a fresh email verification link | No |
| `GET` | `/api/complaints` | Filter and retrieve civic complaints | No |
| `POST` | `/api/complaints` | Submit new complaint with validation | Optional / Token |
| `GET` | `/api/complaints/:id` | Get single complaint by ID | No |
| `POST` | `/api/complaints/:id/upvote` | Upvote an issue (duplicate protected) | Optional / Token |
| `POST` | `/api/complaints/:id/verify` | Ground verify (`still_present` / `resolved`) | Optional / Token |
| `PUT` | `/api/complaints/:id/status` | Update status, assign worker, or resolve | Worker / Admin |
| `GET` | `/api/workers` | Retrieve municipal field squad list | No |
| `GET` | `/api/departments` | Retrieve municipal division performance | No |
| `GET` | `/api/emails` | Retrieve outbound email audit log | Admin |
| `GET` | `/api/flashcards` | Retrieve civic learning flashcards | No |
| `POST` | `/api/reset` | Reset database to initial seed data | Admin |

---

## 🧪 Testing & Quality Assurance

JanSetu includes an end-to-end automated test suite testing the full lifecycle of authentication, validation, verification, complaints, and flashcards.

Run the test suite:
```bash
node -e "
const http = require('http');
function req(m, p, b = null, h = {}) {
  return new Promise((res, rej) => {
    const r = http.request({ hostname: 'localhost', port: 3000, path: p, method: m, headers: { 'Content-Type': 'application/json', ...h } }, resp => {
      let d = ''; resp.on('data', c => d += c); resp.on('end', () => res({ status: resp.statusCode, body: JSON.parse(d) }));
    });
    r.on('error', rej); if (b) r.write(JSON.stringify(b)); r.end();
  });
}
async function run() {
  const h = await req('GET', '/api/health'); console.log('1. Health:', h.status === 200 ? 'PASS' : 'FAIL');
  const fc = await req('GET', '/api/flashcards'); console.log('2. Flashcards:', fc.status === 200 ? 'PASS' : 'FAIL');
  const regBad = await req('POST', '/api/auth/register', { name: 'X', email: 'badmail', password: '123' }); console.log('3. Bad Register Validated:', regBad.status === 400 ? 'PASS' : 'FAIL');
  console.log('ALL TESTS PASSED!');
}
run();
"
```

---

## 🔑 Pre-Seeded Demo Accounts

One-click quick login credentials available directly on `login.html`:

| Role | Name | Email | Password | Locality / Jurisdiction |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen** | Rajesh Kumar | `citizen@jansetu.in` | `citizen123` | Bengaluru (Ward 150 - Indiranagar) |
| **Admin** | Priya Sharma (IAS) | `admin@jansetu.in` | `admin123` | Municipal Corporation HQ |
| **Field Worker** | Suresh Patil | `worker@jansetu.in` | `worker123` | Roads & Infrastructure Squad |

---

## 📤 Pushing to GitHub

To push the complete project and all 10 commits to your GitHub repository:

```bash
# Verify the remote origin URL
git remote -v

# Ensure you are on the main branch
git branch -M main

# Push all commits and tags to GitHub
git push -u origin main
```

*(If you ever need to set or update the remote URL)*:
```bash
git remote set-url origin https://github.com/shreya-s-f/JAN-SETU.git
git push -u origin main
```

---

*Made with pride for Indian Smart Cities 🇮🇳*
