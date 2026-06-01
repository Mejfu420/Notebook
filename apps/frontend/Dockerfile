FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY shared/ ./shared/

RUN npm install

COPY apps/frontend/ ./apps/frontend/

WORKDIR /app/apps/frontend
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/package.json ./package.json

USER nextjs

EXPOSE 3000
CMD ["npm", "start"]