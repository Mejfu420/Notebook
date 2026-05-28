FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY shared/ ./shared/

RUN npm ci

COPY apps/backend/ ./apps/backend/

WORKDIR /app/apps/backend
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
USER node

COPY apps/backend/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/apps/backend/dist ./dist

EXPOSE 8080

CMD ["node", "dist/index.js"]