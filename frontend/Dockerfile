FROM node:24-alpine AS build

WORKDIR /app

RUN corepack enable

ARG VITE_BACKEND_URL
ARG VITE_PUSHER_HOST
ARG VITE_PUSHER_PORT
ARG VITE_PUSHER_SCHEME
# Pusher application IDs are public browser configuration, not credentials.
ARG VITE_PUSHER_PUBLIC_ID

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_PUSHER_HOST=$VITE_PUSHER_HOST \
    VITE_PUSHER_PORT=$VITE_PUSHER_PORT \
    VITE_PUSHER_SCHEME=$VITE_PUSHER_SCHEME

COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY frontend/ ./
RUN VITE_PUSHER_APP_KEY="$VITE_PUSHER_PUBLIC_ID" yarn build

FROM node:24-alpine AS dev

WORKDIR /app

RUN corepack enable

COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY frontend/ ./

EXPOSE 5173
EXPOSE 4784

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM nginxinc/nginx-unprivileged:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

COPY frontend/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --spider http://127.0.0.1:8080/health || exit 1
