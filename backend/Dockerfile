# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install && \
    npx prisma generate

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/
RUN npm install && \
    npx prisma generate
COPY src ./src/
RUN npm run build

# ─── Stage 3: Production ──────────────────────────────────────────────────────
FROM node:24-alpine AS production
WORKDIR /app

# Security: run as non-root user
RUN apk add --no-cache openssl dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

ENV NODE_ENV=production

# Copy production node_modules and Prisma client
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist
COPY --from=builder --chown=nodeuser:nodejs /app/prisma ./prisma
COPY --chown=nodeuser:nodejs package*.json ./

# Create logs directory
RUN mkdir -p /app/logs && chown nodeuser:nodejs /app/logs

USER nodeuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
