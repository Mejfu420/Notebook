FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/ ./apps/backend/
COPY apps/database/ ./apps/database/

RUN npm ci

RUN npm run build --workspace=backend

EXPOSE 8080

CMD npx prisma migrate deploy --schema=./apps/database/schema.prisma && node apps/backend/dist/index.js