# BASE
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY ./ .

EXPOSE 80

# Start the process
ENTRYPOINT ["npm", "start"]
