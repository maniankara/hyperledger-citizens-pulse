FROM node:10
RUN mkdir -p /usr/src/api
RUN mkdir -p /usr/src/network

WORKDIR /usr/src/api
COPY package*.json /usr/src/api/

RUN npm install

COPY . .
EXPOSE 5000

CMD ["npm", "run", "start"]
