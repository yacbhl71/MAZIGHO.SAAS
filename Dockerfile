# Production Dockerfile for Google Cloud Run
FROM node:22-slim AS builder

WORKDIR /app

# Install dependencies
COPY package.json .npmrc* ./
RUN npm install --legacy-peer-deps --no-audit --no-fund --loglevel=error

COPY . .

# Build client and server bundles
RUN npm run build > /tmp/build.log 2>&1 || (cat /tmp/build.log && exit 1)

# Production runtime stage
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server-dist ./server-dist
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts/run-schema-bootstrap.mjs ./scripts/run-schema-bootstrap.mjs

EXPOSE 8080

CMD ["sh", "-c", "(node scripts/run-schema-bootstrap.mjs || echo '[schema-bootstrap] non-fatal notice') & exec node server-dist/index.js"]

