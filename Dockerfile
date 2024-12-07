FROM node:20.18.0
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000:3001
CMD ["npm","run","start:dev"]