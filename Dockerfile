FROM node:12
RUN npm install -g --unsafe-perm prisma2@2.0.0-preview-12
RUN mkdir /app
WORKDIR /app

COPY package.json /app
COPY src /app/src
COPY test /app/test
COPY .env /app/

RUN npm install
# RUN npm audit fix --force

EXPOSE 7515
CMD ["npm", "start"]