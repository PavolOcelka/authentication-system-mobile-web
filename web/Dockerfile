# syntax=docker/dockerfile:1
#
# Build context: the monorepo ROOT (not web/).
# docker-compose passes context: . and dockerfile: web/Dockerfile.
#
# Why the monorepo root as context?
#   Next.js needs the shared/ package at build time for the @shared alias.
#   outputFileTracingRoot is set to the monorepo root so standalone output
#   includes shared/ files and server.js sits at web/server.js inside standalone.

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

# ──────────────────────────────────────────────
# Stage 1: Install web dependencies
# ──────────────────────────────────────────────
FROM base AS deps
WORKDIR /app/web
# Copy only the package manifests first to maximise layer cache reuse.
COPY web/package.json web/package-lock.json* ./
RUN npm ci

# ──────────────────────────────────────────────
# Stage 2: Build
# ──────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

# Copy shared library — needed for the @shared alias during next build.
COPY shared ./shared
RUN cd shared && npm ci

# Copy web source and the dependencies installed in the deps stage.
COPY web ./web
COPY --from=deps /app/web/node_modules ./web/node_modules

# NEXT_PUBLIC_* variables are baked into the JS bundle at build time.
# Pass them as --build-arg values from docker-compose (sourced from .env).
ARG NEXT_PUBLIC_API_KEY
ARG NEXT_PUBLIC_AUTH_DOMAIN
ARG NEXT_PUBLIC_PROJECT_ID
ARG NEXT_PUBLIC_STORAGE_BUCKET
ARG NEXT_PUBLIC_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_APP_ID
ARG NEXT_PUBLIC_MEASUREMENT_ID
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY

ENV NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY \
    NEXT_PUBLIC_AUTH_DOMAIN=$NEXT_PUBLIC_AUTH_DOMAIN \
    NEXT_PUBLIC_PROJECT_ID=$NEXT_PUBLIC_PROJECT_ID \
    NEXT_PUBLIC_STORAGE_BUCKET=$NEXT_PUBLIC_STORAGE_BUCKET \
    NEXT_PUBLIC_MESSAGING_SENDER_ID=$NEXT_PUBLIC_MESSAGING_SENDER_ID \
    NEXT_PUBLIC_APP_ID=$NEXT_PUBLIC_APP_ID \
    NEXT_PUBLIC_MEASUREMENT_ID=$NEXT_PUBLIC_MEASUREMENT_ID \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

WORKDIR /app/web
RUN npm run build

# ──────────────────────────────────────────────
# Stage 3: Production runner
# ──────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as a non-root user for security.
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# The standalone output mirrors the monorepo structure (because outputFileTracingRoot
# is set to the repo root). After copying, the layout in /app is:
#   /app/web/server.js          ← entry point
#   /app/web/.next/server/      ← SSR bundles
#   /app/web/node_modules/      ← minimal subset
#   /app/shared/src/            ← traced shared files
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/standalone ./

# Static assets and public files must be alongside server.js.
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/static ./web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/web/public ./web/public

USER nextjs
EXPOSE 3000

CMD ["node", "web/server.js"]
