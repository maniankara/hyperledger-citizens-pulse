FROM node:11-alpine

RUN mkdir -p /usr/src/api
RUN mkdir -p /usr/src/network

WORKDIR /usr/src/api

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start"]
