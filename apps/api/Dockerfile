# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --workspace=apps/api --workspace=packages/shared --include-workspace-root --ignore-scripts

FROM base AS builder
COPY --from=deps /app ./
COPY . .
RUN npm run build --workspace=packages/shared \
  && npm run build --workspace=apps/api

FROM base AS development
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --workspace=apps/api --workspace=packages/shared --include-workspace-root --ignore-scripts
COPY . .
RUN npm run build --workspace=packages/shared
COPY apps/api/docker-entrypoint.dev.sh ./apps/api/docker-entrypoint.dev.sh
RUN sed -i 's/\r$//' ./apps/api/docker-entrypoint.dev.sh && chmod +x ./apps/api/docker-entrypoint.dev.sh
WORKDIR /app
EXPOSE 4000
ENTRYPOINT ["sh", "./apps/api/docker-entrypoint.dev.sh"]

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nestjs

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --workspace=apps/api --workspace=packages/shared --include-workspace-root --omit=dev --ignore-scripts \
  && npm cache clean --force

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --chown=nestjs:nodejs apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh
RUN sed -i 's/\r$//' ./apps/api/docker-entrypoint.sh && chmod +x ./apps/api/docker-entrypoint.sh

USER nestjs
WORKDIR /app/apps/api
EXPOSE 4000
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
