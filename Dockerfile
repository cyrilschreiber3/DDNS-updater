FROM node:18-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk update && apk upgrade

COPY . /usr/src/app
RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "preview"]
