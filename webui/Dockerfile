FROM node:10
RUN mkdir -p /usr/src/webui

WORKDIR /usr/src/webui
COPY package*.json /usr/src/webui/

RUN npm install

COPY . .
EXPOSE 3000

CMD ["npm", "start"]