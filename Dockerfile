FROM node:22.2.0-slim as base

WORKDIR /usr/src/app

COPY . .

RUN npm ci

RUN npm run build

FROM base as scheduler
COPY --from=base /usr/src/app /usr/src/app
CMD ["node dist/src/index.js"]

FROM base as server
COPY --from=base /usr/src/app /usr/src/app
CMD ["node dist/src/server.js"]