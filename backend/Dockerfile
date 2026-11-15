# Multi-stage Dockerfile for CabGo Backend (Node.js 22 LTS / Express / TypeScript)

# Stage 1: Build & Dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and configuration
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript in /app/dist
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Stage 2: Production Minimal Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy production node_modules and built dist artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Create public uploads directory with proper permissions
RUN mkdir -p /app/public/uploads && \
    chown -R appuser:nodejs /app

USER appuser

EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/v1/health || exit 1

CMD ["node", "dist/index.js"]
