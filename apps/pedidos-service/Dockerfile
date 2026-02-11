# Build stage
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm --filter pedidos-service build

# Production stage
FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY --from=builder /app/apps/pedidos-service/dist ./apps/pedidos-service/dist
COPY --from=builder /app/apps/pedidos-service/package.json ./apps/pedidos-service/
COPY --from=builder /app/packages ./packages

RUN pnpm install --prod --frozen-lockfile

WORKDIR /app/apps/pedidos-service

EXPOSE 3002

CMD ["node", "dist/main.js"]
