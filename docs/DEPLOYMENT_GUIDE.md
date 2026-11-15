# CabGo Production Deployment Guide

This guide describes how to deploy the **CabGo** full-stack cab booking platform across cloud providers: **Vercel** (Frontend), **Render / Railway / Docker Host** (Backend), and **Supabase** (Database & Storage).

---

## 1. Architecture & Deployment Matrix

| Component | Technology | Primary Host | Alternative Hosts |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router) | [Vercel](https://vercel.com) | AWS Amplify, Netlify, Docker |
| **Backend API** | Node.js 22 + Express 5 + Socket.IO | [Railway](https://railway.app) / [Render](https://render.com) | AWS ECS, Fly.io, DigitalOcean |
| **Database** | PostgreSQL | [Supabase](https://supabase.com) | Neon, AWS RDS, Self-hosted PG |
| **Storage** | Object Storage | Supabase Storage | AWS S3, Cloudflare R2 |
| **CI/CD** | Jenkins LTS + Docker | Jenkins Server | GitHub Actions |

---

## 2. Step 1: Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** and run the project migrations in order:
   - `database/migrations/001_initial_schema.sql` (Creates users, drivers, vehicles, rides, payments, ratings, notifications, support tickets)
   - `database/migrations/002_audit_logs.sql` (Creates admin audit logs table and indexes)
3. Set up Storage:
   - Create a public bucket named `cabgo-uploads`.
   - Configure public read policies for avatars and driver verification documents.
4. Obtain the API Keys from **Project Settings** -> **API**:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

---

## 3. Step 2: Backend Deployment (Railway or Render)

### Option A: Railway
1. Sign in to [Railway](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `balamurugan29-commits/cabgo`.
4. In **Settings**, set:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
5. In **Variables**, add:
   ```env
   NODE_ENV=production
   PORT=5001
   CLIENT_URL=https://<your-frontend-domain>.vercel.app
   SUPABASE_URL=https://<your-supabase-project>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   CLERK_SECRET_KEY=<your-clerk-secret-key>
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
   ```

### Option B: Render
1. Sign in to [Render](https://render.com).
2. Create a new **Web Service** pointing to your repository.
3. Configure:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `node dist/index.js`
4. Provide the environment variables listed above.

---

## 4. Step 3: Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project** and import `balamurugan29-commits/cabgo`.
3. Configure Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
4. Configure Environment Variables:
   ```env
   NEXT_PUBLIC_API_URL=https://<your-deployed-backend-domain>/api/v1
   NEXT_PUBLIC_SOCKET_URL=https://<your-deployed-backend-domain>
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
   CLERK_SECRET_KEY=<your-clerk-secret-key>
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
   ```
5. Click **Deploy**. Vercel will build and assign your production domain.

---

## 5. Step 4: Automated Deployment via Jenkins Pipeline

When configuring automated deployment inside `Jenkinsfile`:

1. Store your `VERCEL_TOKEN` in the Jenkins Credentials store.
2. In the `Deployment` stage of `Jenkinsfile`:
   ```groovy
   withCredentials([string(credentialsId: 'VERCEL_TOKEN', variable: 'VERCEL_TOKEN')]) {
       sh 'npx vercel --prod --token "$VERCEL_TOKEN" --yes ./frontend'
   }
   ```
3. Store your Docker Hub or Cloud Container Registry credentials (`DOCKER_REGISTRY_USER`, `DOCKER_REGISTRY_PASS`) to publish tagged release images automatically upon merge into `main`.

---

## 6. Verification & Post-Deployment Checklist

After deployment, verify all systems:

- [ ] **Health API**: `GET https://<backend-domain>/api/v1/health` returns `{"status":"ok"}`.
- [ ] **Frontend Home**: Visit `https://<frontend-domain>/` and verify hero section and navigation load.
- [ ] **Auth Flow**: Log in via Clerk and verify redirection to `/dashboard` or `/book-ride`.
- [ ] **Map & Geocoding**: Search for an address in `/book-ride` and verify Leaflet pin and routing render.
- [ ] **Socket.IO**: Open browser dev tools and confirm live WebSocket connection on `wss://<backend-domain>`.
- [ ] **Payments**: Trigger a test booking and ensure Stripe Payment Intent creates without errors.
