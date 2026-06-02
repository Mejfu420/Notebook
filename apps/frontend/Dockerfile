FROM node:20-bullseye-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ libc6 && rm -rf /var/lib/apt/lists/*

COPY apps/frontend/package*.json ./apps/frontend/
COPY shared/ ./shared/
COPY package*.json ./

WORKDIR /app/apps/frontend
RUN npm ci

WORKDIR /app
COPY . .

WORKDIR /app/apps/frontend
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npx next --version

RUN npm run build

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/package.json ./package.json
COPY --from=builder /app/apps/frontend/node_modules ./node_modules

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]