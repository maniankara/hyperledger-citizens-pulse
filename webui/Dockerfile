FROM node:10
RUN mkdir -p /usr/src/webui

WORKDIR /usr/src/webui
COPY . .

RUN npm install

EXPOSE 5000

CMD ["npm", "start"]
