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

# --- Produção: build estático + nginx (Easypanel/Traefik) ---
FROM base AS build-static
RUN npm run build

FROM nginx:1.27-alpine AS prod
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-static /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
