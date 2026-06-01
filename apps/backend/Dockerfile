FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/ ./apps/backend/
COPY apps/database/ ./apps/database/
COPY shared/ ./shared/
#COPY prisma ./prisma/
COPY apps/database/prisma.config.ts ./

RUN npm install
RUN npm run build --workspace=backend

EXPOSE 8080

ENV PRISMA_CONFIG_PATH=/app/apps/database/prisma.config.ts

CMD npx prisma migrate deploy --schema=./apps/database/schema.prisma && node apps/backend/dist/server.js