FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY client/package.json client/

RUN npm ci --include-workspace-root

COPY packages/shared packages/shared
COPY client client

WORKDIR /app/packages/shared
RUN npx tsc

WORKDIR /app/client
RUN npm run build

FROM nginx:alpine AS production

COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
