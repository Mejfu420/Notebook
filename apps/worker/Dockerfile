FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/worker/package*.json ./apps/worker/
COPY shared/ ./shared/

RUN npm install

COPY apps/worker/ ./apps/worker/

ARG CLERK_SECRET_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY

WORKDIR /app/apps/worker
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
USER node

COPY apps/worker/package*.json ./
RUN npm install

COPY --from=builder /app/apps/worker/dist ./dist

CMD ["node", "dist/index.js"]