FROM node:18 as build

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY  . .

RUN yarn build

FROM node:18 as dev

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY --from=build  /usr/src/app/ ./

RUN npm install pm2 -g

CMD ["pm2-runtime", "dist/index.js"]