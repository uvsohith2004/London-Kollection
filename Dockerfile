# syntax=docker/dockerfile:1.7

###############################
# Base
###############################
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

###############################
# Prune
###############################
FROM base AS pruner

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm dlx turbo prune hono --docker

###############################
# Install
###############################
FROM base AS installer

WORKDIR /app

COPY --from=pruner /app/out/json/ .

RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

###############################
# Build
###############################
FROM installer AS builder

RUN pnpm --filter hono build

###############################
# Runtime
###############################
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV PORT=8080

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app
COPY --from=builder /app .

WORKDIR /app/apps/server

EXPOSE 8080

CMD ["pnpm", "start"]
