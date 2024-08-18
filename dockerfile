FROM node:16.17.1-alpine3.16 
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
# CMD [ "node","src/index.js" ]
CMD ["npm","start"]
