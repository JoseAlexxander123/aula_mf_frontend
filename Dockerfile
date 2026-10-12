# Imagen mínima para VPS: compila y copia solo el servidor standalone (~120 MB en lugar de >500 MB).
FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:24-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    # Obligatorio: el servidor standalone usa HOSTNAME para enlazarse y reanudar el streaming.
    HOSTNAME=0.0.0.0 \
    # Limita la memoria de V8 en VPS pequeños (ajustar según el plan).
    NODE_OPTIONS=--max-old-space-size=384
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
USER app
EXPOSE 3000
CMD ["node", "server.js"]
