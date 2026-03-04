# Stage 1 — Build
FROM node:22.22.0-alpine3.23 AS build

ARG COMMIT_SHA=dev
ENV PUBLIC_COMMIT_SHA=${COMMIT_SHA}

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY sites/docs-kevinryan-io/package.json ./sites/docs-kevinryan-io/

WORKDIR /app/sites/docs-kevinryan-io
RUN pnpm install --frozen-lockfile

WORKDIR /app
COPY docs/ ./docs/
COPY sites/docs-kevinryan-io/ ./sites/docs-kevinryan-io/

# Replace symlink with real content (Docker COPY does not follow symlinks)
RUN rm -rf /app/sites/docs-kevinryan-io/src/content/docs && \
    cp -r /app/docs /app/sites/docs-kevinryan-io/src/content/docs

WORKDIR /app/sites/docs-kevinryan-io
RUN pnpm build

# Stage 2 — Serve
FROM nginx:1.28.2-alpine

LABEL org.opencontainers.image.source="https://github.com/DevOpsKev/kevin-ryan-platform"

COPY --from=build /app/sites/docs-kevinryan-io/dist /usr/share/nginx/html
COPY sites/docs-kevinryan-io/nginx.conf /etc/nginx/nginx.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /run/nginx.pid && \
    chown nginx:nginx /run/nginx.pid

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
