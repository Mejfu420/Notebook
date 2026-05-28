FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY apps/db/package*.json ./apps/db/
RUN npm ci

COPY apps/db/ ./apps/db/

WORKDIR /app/apps/db

CMD ["npx", "prisma", "migrate", "deploy"]