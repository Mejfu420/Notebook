FROM node:20-bullseye-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY shared/ ./shared/

RUN npm install --force --no-package-lock lightningcss@1.29.1 || true
RUN npm install

COPY apps/frontend/ ./apps/frontend/

WORKDIR /app/apps/frontend
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build -- --no-turbo

FROM node:20-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/package.json ./package.json

USER nextjs

EXPOSE 3000
CMD ["npm", "start"]