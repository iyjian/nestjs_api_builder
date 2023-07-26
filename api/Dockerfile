FROM node:16.15.0-slim

ENV TZ=Asia/Shanghai \
    DEBIAN_FRONTEND=noninteractive

ENV NODE_ENV=development

RUN ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime \
    && echo ${TZ} > /etc/timezone \
    && dpkg-reconfigure --frontend noninteractive tzdata \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

RUN npm install pnpm -g

ADD package.json /usr/src/app

ADD pnpm-lock.yaml /usr/src/app

RUN pnpm config set sharp_binary_host "https://npmmirror.com/mirrors/sharp"
RUN pnpm config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"

RUN pnpm i

COPY . /usr/src/app

RUN pnpm build

RUN cp src/features/tool/config/OpenSans-Regular.ttf dist/features/tool/config

ENTRYPOINT ["yarn", "run", "start:prod"]
