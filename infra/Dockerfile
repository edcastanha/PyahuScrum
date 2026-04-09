# Dockerfile para desenvolvimento e build local do frontend
FROM node:22-slim AS base

WORKDIR /app

# COPY é relativo ao build context (repo root em docker-compose)
COPY DevPortfolio/package*.json ./
RUN npm install

COPY DevPortfolio/ ./

FROM base AS dev
EXPOSE 3000
CMD ["npm", "start"]

FROM base AS build
CMD ["npm", "run", "build"]
