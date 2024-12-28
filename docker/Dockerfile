FROM node:20-bookworm

COPY . /tmp/

WORKDIR /tmp/

RUN npm install
ENTRYPOINT [ "npm", "run", "build" ]