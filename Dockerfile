FROM node:22.2.0-slim

WORKDIR /usr/src/app

COPY . .

RUN npm ci

RUN npm run build
