FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/worker/package*.json ./apps/worker/
COPY shared/ ./shared/

RUN npm ci

COPY apps/worker/ ./apps/worker/

WORKDIR /app/apps/worker
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
USER node

COPY apps/worker/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/apps/worker/dist ./dist

CMD ["node", "dist/index.js"]