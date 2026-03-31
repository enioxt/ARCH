# EGOS Arch — Multi-stage Docker build
# AI-assisted architecture design tool

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile 2>/dev/null || npm install

COPY . .

RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm install --omit=dev 2>/dev/null || npm install --production

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server and AI prompts + lib (needed at runtime)
COPY server.ts ./
COPY src/ai/ ./src/ai/
COPY src/lib/generation-engine.ts ./src/lib/generation-engine.ts
COPY src/lib/prompt-generator.ts ./src/lib/prompt-generator.ts

# Copy public assets (presentation page, images)
COPY public/ ./public/

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["npx", "tsx", "server.ts"]
