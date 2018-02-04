from dahus/docker-nodejs-nginx

WORKDIR /app
ADD package.json /app/
RUN npm install
ADD . /app

