FROM node:18-alpine3.15

WORKDIR /app

COPY . .

RUN yarn install
RUN yarn build

ENTRYPOINT ["yarn", "preview"]
