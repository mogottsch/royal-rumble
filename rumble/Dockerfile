FROM node:18-alpine3.15

WORKDIR /app

COPY . .

RUN yarn install

ENTRYPOINT ["yarn", "dev"]
