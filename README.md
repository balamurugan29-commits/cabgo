# 🚖 CabGo — Enterprise Cab Booking Application (Uber Clone)

A modern, full-stack, scalable Cab Booking Application built with **Next.js 16 (React 19)**, **TypeScript**, **Tailwind CSS**, **Node.js/Express 5**, **Supabase PostgreSQL**, **Clerk Authentication**, **Leaflet.js/OpenStreetMap**, and **Stripe Payments**.

---

## 🌟 Key Highlights & Roles

### 1. 👤 Customer (Passenger) Module
- **Onboarding & Auth**: Email/Password and Google OAuth with Clerk.
- **Profile Management**: Profile photo uploads, emergency SOS contacts, phone numbers.
- **Interactive Map Booking**: Leaflet.js + OpenStreetMap with instant route visualization, current GPS detection, and multi-stop waypoints.
- **Fleet Selection**: Bike, Auto, Mini, Sedan, and SUV with transparent upfront fare estimation.
- **Dynamic Fare Engine**: Formula-based calculations (`Base + (Distance × Per_KM) + (Duration × Per_Min) + Surcharge - Discount`).
- **Live Ride Tracking**: Socket.IO room subscriptions displaying driver approach and arrival in real-time.
- **Stripe Payments**: In-app Payment Intent confirmation with automated email trip receipts.
- **Trip Reviews & SOS**: 5-star ratings, driver reviews, and one-tap emergency broadcast alert.

### 2. 🚘 Driver Module
- **Driver Verification Gatekeeper**: Driver license, vehicle registration, and ID document uploads; unverified/pending drivers are strictly blocked from going online.
- **Availability Control**: One-click Online/Offline toggle with live broadcast to matching engine.
- **Real-Time Dispatching**: Instant incoming ride modal requests with pickup, dropoff, distance, and earnings estimate.
- **Turn-by-Turn Lifecycle**: State transitions (`ACCEPTED` ➡️ `DRIVER_ARRIVING` ➡️ `ARRIVED` ➡️ `IN_PROGRESS` ➡️ `COMPLETED`).
- **Earnings Hub**: Real-time breakdown of daily, weekly, monthly, and lifetime earnings plus platform commission cuts.

### 3. 🛡️ Admin Management Panel
- **Executive Analytics**: Real-time KPI metrics for active rides, completed trips, platform gross revenue, and commission earned.
- **Driver Verification**: Document inspection, one-click driver approval or rejection with custom reason notes.
- **Customer Oversight**: View passenger profiles, contact info, total spend, and account suspension toggle.
- **Dynamic Fare Management**: Live editing of base fares, per-kilometer rates, per-minute rates, and minimum fares across all vehicle categories without server restarts.
- **Promo Code Engine**: Discount generator (percentage vs. flat amount), validity windows, usage limits, and maximum caps.
- **Support & Dispute Center**: Ticket resolution and refund management.

---

## 🏗️ Architecture & Technology Stack

```
                          ┌──────────────────────────┐
                          │   Next.js 16 Frontend    │
                          │   (Tailwind, Leaflet.js) │
                          └─────────────┬────────────┘
                                        │
                         HTTP REST / WS │ Socket.IO
                                        ▼
                          ┌──────────────────────────┐
                          │  Express 5 Node Backend  │
                          │ (TypeScript, Zod, Stripe)│
                          └───────┬────────────┬─────┘
                                  │            │
            ┌─────────────────────┴──┐      ┌──┴──────────────────┐
            ▼                        ▼      ▼                     ▼
     ┌──────────────┐         ┌───────────┐ ┌──────────────┐ ┌──────────────┐
     │   Supabase   │         │   Clerk   │ │    Stripe    │ │ Leaflet/OSRM │
     │  PostgreSQL  │         │   Auth    │ │   Payments   │ │ Map Routing  │
     └──────────────┘         └───────────┘ └──────────────┘ └──────────────┘
```

| Component | Technology | Description |
|-----------|-----------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript | Server Components, App Router, Lucide Icons |
| **Styling** | Tailwind CSS v4, Shadcn UI | Dark/light theme, responsive design |
| **Maps** | Leaflet.js, OpenStreetMap, OSRM | Custom SVG markers, GPS detection, routing |
| **Backend** | Node.js, Express 5, TypeScript | Modular Controller-Service-Store architecture |
| **Real-time** | Socket.IO (v4.8) | Room-based ride dispatch & location telemetry |
| **Database** | Supabase (PostgreSQL 15) | 18 normalized tables, RLS, updated_at triggers |
| **Auth** | Clerk Authentication | Role-based RBAC + dev simulation (`x-role`) |
| **Payments** | Stripe API | PaymentIntents, Webhooks, mock fallback |
| **Validation** | Zod v3 | Strict schema enforcement on API payloads |

---

## 📂 Project Structure

```
cab-booking-app/
├── backend/                        # Express.js REST API + Socket.IO
│   ├── src/
│   │   ├── config/                 # Env, Supabase, Clerk, Stripe configs
│   │   ├── controllers/            # Route controllers
│   │   ├── middleware/             # Auth, role check, validation, rate limiting
│   │   ├── routes/                 # Express API routes
│   │   ├── services/               # Core business logic
│   │   ├── sockets/                # Socket.IO connection & event handlers
│   │   ├── types/                  # TypeScript interfaces & enums
│   │   ├── utils/                  # In-memory store, errors, distance helpers
│   │   ├── validators/             # Zod input validation schemas
│   │   └── index.ts                # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/                       # Next.js 16 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (admin)/            # Admin dashboard & management routes
│   │   │   ├── (customer)/         # Customer booking & ride routes
│   │   │   ├── (driver)/           # Driver dispatch & earnings routes
│   │   │   ├── layout.tsx          # Root layout with QueryClient
│   │   │   └── page.tsx            # High-conversion landing page
│   │   ├── components/
│   │   │   ├── maps/               # Leaflet SSR-safe map & markers
│   │   │   ├── shared/             # Navbar, sidebar, stat-card, empty-state
│   │   │   └── ui/                 # Shadcn Button, Card, Badge, Input, etc.
│   │   ├── lib/                    # Axios client, Socket.IO client, constants
│   │   ├── services/               # Frontend API callers
│   │   └── types/                  # Shared frontend types
│   ├── package.json
│   └── .env.example
├── database/
│   ├── migrations/                 # 001_initial_schema.sql (18 tables)
│   └── seeds/                      # 001_fare_settings.sql (Fleet pricing)
├── docs/                           # Architecture specs & API endpoints
├── tests/
│   └── api.test.ts                 # Full integration test suite (18 assertions)
└── README.md
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: >= 20.0.0
- **npm** or **pnpm** / **yarn**

### 2. Clone and Setup
```bash
git clone <your-repo-url>
cd cab-booking-app
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env

# Run TypeScript compilation check
npm run build

# Start backend server (Port 5000)
npm run dev
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env

# Build check
npm run build

# Start Next.js development server (Port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!NOTE]
> The application is equipped with a high-performance **in-memory persistence store** pre-seeded with sample users, vehicles, and promo codes (`FIRST50`, `UBERNEW`, `FESTIVE20`). You can test the entire app end-to-end without configuring third-party services immediately!

---

## 🧪 Automated Testing

The project includes an end-to-end integration test suite verifying the 5 core system pillars:
1. **Haversine Geodesic Distance Engine**
2. **Dynamic Fare Pricing & Promo Caps**
3. **Driver Verification Gatekeeper & Online Status Rules**
4. **Complete 6-Stage Ride State Machine**
5. **Stripe Payment Settlement & Receipt Generation**

Execute tests with:
```bash
cd backend
npx tsx ../tests/api.test.ts
```

Output:
```
🧪 Starting Cab Booking Application Test Suite...
  ✅ PASS: Haversine distance accurate (4.45 km)
  ✅ PASS: Sedan fare calculation matches formula: expected ₹285, got ₹285
  ✅ PASS: Promo code FIRST50 correctly discounts up to max cap: expected ₹185, got ₹185
  ✅ PASS: New driver registered with PENDING verification status
  ✅ PASS: Unverified/Pending driver blocked from going online
  ✅ PASS: Admin successfully approved driver
  ✅ PASS: Approved driver successfully went ONLINE
  ✅ PASS: Ride created in SEARCHING status
  ✅ PASS: Driver assigned and ride moved to ACCEPTED
  ✅ PASS: Driver profile correctly locked to ride
  ✅ PASS: Ride state transitioned to DRIVER_ARRIVING
  ✅ PASS: Ride state transitioned to ARRIVED
  ✅ PASS: Ride state transitioned to IN_PROGRESS
  ✅ PASS: Trip start timestamp recorded
  ✅ PASS: Ride state transitioned to COMPLETED
  ✅ PASS: Final bill calculated upon completion
  ✅ PASS: Stripe payment intent created with amount: ₹211
  ✅ PASS: Payment confirmed with completed status

🏁 Test Summary: 18 Passed, 0 Failed
```

---

## 🗄️ Database Setup (Supabase)

1. Create a new PostgreSQL database on [Supabase](https://supabase.com).
2. Navigate to the **SQL Editor** in the Supabase Dashboard.
3. Run `database/migrations/001_initial_schema.sql` to generate all 18 tables and constraints.
4. Run `database/seeds/001_fare_settings.sql` to populate initial vehicle category pricing.
5. Copy your **Project URL** and **Service Role Secret** into `backend/.env`.

---

## ⚡ Socket.IO Real-Time Events

| Channel / Event | Payload | Purpose |
|-----------------|---------|---------|
| `driver:join` | `{ driverId }` | Driver joins personal notification channel |
| `driver:location` | `{ lat, lng, heading }` | Driver telemetry broadcast |
| `ride:join` | `{ rideId }` | Customer/Driver join private ride room |
| `ride:status_update` | `{ rideId, status }` | Broadcast ride phase update to participants |
| `driver:new_ride_request` | `RideObject` | Emitted to matching nearby online drivers |
| `ride:payment_completed` | `{ rideId, amount }` | Real-time payment confirmation broadcast |

---

## 🌐 Production Deployment

### 1. Deploy Frontend to Vercel
- Import repository into [Vercel](https://vercel.com).
- Root Directory: `frontend`
- Framework Preset: `Next.js`
- Set Environment Variables:
  - `NEXT_PUBLIC_API_URL`: Your deployed backend URL + `/api`
  - `NEXT_PUBLIC_SOCKET_URL`: Your deployed backend URL
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk Production Key
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe Live Key

### 2. Deploy Backend to Render / Railway
- Create a new Web Service pointing to `backend`.
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Set Environment Variables:
  - `NODE_ENV`: `production`
  - `PORT`: `5000`
  - `FRONTEND_URL`: Your deployed frontend Vercel URL
  - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`
  - `CLERK_SECRET_KEY`
  - `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`

---

## 📄 License
MIT License. Built with ❤️ for modern urban mobility.
