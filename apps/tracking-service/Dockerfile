# Build stage
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm --filter tracking-service build

# Production stage
FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY --from=builder /app/apps/tracking-service/dist ./apps/tracking-service/dist
COPY --from=builder /app/apps/tracking-service/package.json ./apps/tracking-service/
COPY --from=builder /app/packages ./packages

RUN pnpm install --prod --frozen-lockfile

WORKDIR /app/apps/tracking-service

EXPOSE 3007

CMD ["node", "dist/main.js"]
