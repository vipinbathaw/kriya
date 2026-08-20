FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY server/package.json server/

RUN npm ci --include-workspace-root

COPY packages/shared packages/shared
COPY server server

WORKDIR /app/packages/shared
RUN npx tsc

WORKDIR /app/server
RUN npx tsc

FROM node:24-alpine AS production

RUN apk add --no-cache curl

WORKDIR /app

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/packages/shared/package.json packages/shared/
# @kriya/shared package.json points `main`/`types` at src/ for dev tooling;
# at runtime only the compiled dist exists, so repoint before starting.
RUN node -e "const fs=require('fs');const p='packages/shared/package.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.main='./dist/index.js';j.types='./dist/index.d.ts';fs.writeFileSync(p,JSON.stringify(j,null,2));"
COPY --from=build /app/server/dist dist
COPY server/migrations migrations
COPY server/seeds seeds
COPY server/package.json .

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "dist/index.js"]
