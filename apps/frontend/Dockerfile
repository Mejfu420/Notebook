FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY shared/ ./shared/

RUN npm ci

COPY apps/frontend/ ./apps/frontend/

WORKDIR /app/apps/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

USER node

COPY --from=builder --chown=node:node /app/apps/frontend/public ./public
COPY --from=builder --chown=node:node /app/apps/frontend/.next ./.next
COPY --from=builder --chown=node:node /app/apps/frontend/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/frontend/package.json ./package.json

EXPOSE 3000
ENV PORT=3000

CMD ["npm", "start"]