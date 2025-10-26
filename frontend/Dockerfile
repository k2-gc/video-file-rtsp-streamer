FROM node:20-alpine

WORKDIR /app
COPY package.json /app/
COPY ./src /app/src/
COPY tsconfig.json /app/
COPY ./public /app/public/
RUN npm install

CMD ["npm", "start"]