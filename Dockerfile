FROM node:14

WORKDIR /app

COPY . /app

RUN npm install

CMD ["node", "src/server.js"]