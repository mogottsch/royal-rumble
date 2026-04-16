FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_BACKEND_URL
ARG VITE_PUSHER_HOST
ARG VITE_PUSHER_PORT
ARG VITE_PUSHER_SCHEME
ARG VITE_PUSHER_APP_KEY

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_PUSHER_HOST=$VITE_PUSHER_HOST \
    VITE_PUSHER_PORT=$VITE_PUSHER_PORT \
    VITE_PUSHER_SCHEME=$VITE_PUSHER_SCHEME \
    VITE_PUSHER_APP_KEY=$VITE_PUSHER_APP_KEY

COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY frontend/ ./
RUN yarn build

FROM nginx:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

COPY frontend/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
