# Docker Containerization & Orchestration Guide for CabGo

This document details the container architecture, multi-stage Dockerfiles, Docker Compose setup, and production deployment strategies for **CabGo**.

---

## 1. Container Architecture

CabGo follows a microservice-style container setup:

```
                  ┌──────────────────────┐
                  │    Docker Compose    │
                  │   or Cloud Ingress   │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│     cabgo-frontend    │         │     cabgo-backend     │
│   (Next.js Standalone)│ ──────> │  (Express 5 / Node 22)│
│       Port 3000       │         │       Port 5001       │
└───────────────────────┘         └───────────┬───────────┘
                                              │
                                              ▼
                                  ┌───────────────────────┐
                                  │  Supabase PostgreSQL  │
                                  │  & External Services  │
                                  └───────────────────────┘
```

---

## 2. Multi-Stage Dockerfile Specifications

### Backend Dockerfile (`backend/Dockerfile`)
The backend uses **Node 22 LTS Alpine** across two stages:
1. **Builder Stage (`node:22-alpine AS builder`)**:
   - Installs all dependencies via `npm ci`
   - Compiles TypeScript to optimized JavaScript (`dist/`)
   - Prunes devDependencies via `npm prune --production`
2. **Runner Stage (`node:22-alpine AS runner`)**:
   - Runs as an unprivileged user (`appuser`, UID 1001)
   - Copies only production `node_modules` and compiled `dist/`
   - Includes automatic healthcheck (`wget --spider http://localhost:5001/api/v1/health`)
   - Final image size: **< 150 MB**

### Frontend Dockerfile (`frontend/Dockerfile`)
The frontend uses **Node 22 LTS Alpine** across three stages:
1. **Deps Stage (`node:22-alpine AS deps`)**: Caches dependencies via `npm ci`.
2. **Builder Stage (`node:22-alpine AS builder`)**: Compiles Next.js with `output: "standalone"` via Turbopack.
3. **Runner Stage (`node:22-alpine AS runner`)**:
   - Runs as unprivileged user (`nextjs`, UID 1001).
   - Only copies standalone `server.js`, minimal runtime dependencies, and `.next/static`.
   - Built-in container healthcheck on port 3000.
   - Final image size: **< 200 MB**

---

## 3. Docker Compose Configuration (`docker-compose.yml`)

The root `docker-compose.yml` orchestrates both services:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: cabgo-backend
    restart: unless-stopped
    ports:
      - "5001:5001"
    environment:
      - PORT=5001
      - NODE_ENV=production
      - CLIENT_URL=http://localhost:3000
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5001/api/v1/health"]
      interval: 15s
      timeout: 5s
      retries: 3
    networks:
      - cabgo-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
        - NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
    container_name: cabgo-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - cabgo-network

networks:
  cabgo-network:
    driver: bridge
```

---

## 4. Operational Commands & Cheat Sheet

### Build and Run with Docker Compose
```bash
# Build and run containers in background
docker compose up -d --build

# Check status and health
docker compose ps

# View live container logs
docker compose logs -f

# Stop and remove containers
docker compose down
```

### Manual Docker Build & Run
```bash
# 1. Build images
docker build -t cabgo-backend:latest ./backend
docker build -t cabgo-frontend:latest ./frontend

# 2. Create bridge network
docker network create cabgo-net

# 3. Run backend
docker run -d --name cabgo-backend \
  --network cabgo-net \
  -p 5001:5001 \
  -e PORT=5001 \
  cabgo-backend:latest

# 4. Run frontend
docker run -d --name cabgo-frontend \
  --network cabgo-net \
  -p 3000:3000 \
  cabgo-frontend:latest
```

---

## 5. Security & Best Practices Implemented

1. **Non-Root Execution**: Both containers execute under dedicated non-root users (`appuser` / `nextjs`) with restricted file system permissions.
2. **Minimal Surface Area**: Alpine base images eliminate unnecessary packages, compilers, and utilities.
3. **No Secret Ingestion in Images**: Secret credentials (Stripe, Clerk, Supabase) are injected at runtime via environment variables, never baked into Docker images.
4. **Automated Healthchecks**: Built-in healthchecks allow container orchestrators (Docker Swarm, Kubernetes, ECS) to automatically heal unhealthy instances.
