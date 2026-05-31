FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/database/package*.json ./apps/database/

RUN npm ci

COPY apps/backend/ ./apps/backend/
COPY apps/database/ ./apps/database/

RUN npx prisma generate --schema=./apps/database/schema.prisma
RUN npm run build --workspace=apps/backend

EXPOSE 8080

CMD npx prisma migrate deploy --schema=./apps/database/schema.prisma && node apps/backend/dist/index.js