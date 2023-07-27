# FROM node:18-alpine as builder

# WORKDIR /usr/src/build

# ADD package.json .

# ADD pnpm-lock.yaml .

# ENV VITE_API_ENDPOINT=/api

# RUN npm install -g pnpm && pnpm i

# COPY . .

# RUN pnpm build

# FROM node:18-alpine

# WORKDIR /usr/src/app

# COPY --from=builder /usr/src/build/dist /usr/src/app/dist
# COPY --from=builder /usr/src/build/index.js /usr/src/app

# RUN yarn add static-web-proxy

# ENTRYPOINT ["node", "index"]

# EXPOSE 3000
FROM node:18-alpine as builder

WORKDIR /app

ADD package.json .

ADD pnpm-lock.yaml .

ENV VITE_API_ENDPOINT=/api

RUN npm install -g pnpm && pnpm i

COPY . .

RUN pnpm build

RUN ls /app/dist

FROM nginx:stable-alpine as production-stage

COPY --from=builder /app/dist /usr/share/nginx/html

COPY ./quickStart/nginx/nginx.conf /etc/nginx/nginx.conf

COPY ./quickStart/nginx/site-enabled/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
