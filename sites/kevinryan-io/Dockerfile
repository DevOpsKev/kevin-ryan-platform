# Stage 1 — Build
FROM node:22.22.0-alpine3.23 AS build

ARG COMMIT_SHA=dev
ENV NEXT_PUBLIC_COMMIT_SHA=${COMMIT_SHA}

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY sites/kevinryan-io/package.json ./sites/kevinryan-io/

WORKDIR /app/sites/kevinryan-io
RUN pnpm install --frozen-lockfile

WORKDIR /app
COPY sites/kevinryan-io/ ./sites/kevinryan-io/

WORKDIR /app/sites/kevinryan-io
RUN pnpm build

# Stage 2 — Serve
FROM nginx:1.28.2-alpine

LABEL org.opencontainers.image.source="https://github.com/DevOpsKev/kevin-ryan-platform"

COPY --from=build /app/sites/kevinryan-io/out /usr/share/nginx/html
COPY sites/kevinryan-io/nginx.conf /etc/nginx/nginx.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /run/nginx.pid && \
    chown nginx:nginx /run/nginx.pid

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
