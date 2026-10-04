# syntax=docker/dockerfile:1
# Multi-stage build: Node builds the static bundle, an unprivileged nginx serves it.
# NOTE: GEMINI_API_KEY is inlined into the client bundle at build time (see vite.config.ts and
# README "Security notes"). Only pass a key that is referrer-restricted and quota-limited.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
ARG GEMINI_API_KEY=""
ENV GEMINI_API_KEY=${GEMINI_API_KEY}
RUN npm run typecheck && npm test -- --run && npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
# nginx-unprivileged runs as uid 101 and listens on 8080.
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
