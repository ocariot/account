FROM node:12-alpine
RUN apk --no-cache add bash curl grep

# Create app directory
RUN mkdir -p /usr/src/ac
WORKDIR /usr/src/ac

# Install app dependencies
COPY package.json /usr/src/ac/
RUN npm install

# Copy app source
COPY . /usr/src/ac

# Build app
RUN npm run build

EXPOSE 3000
EXPOSE 3001

CMD ["npm", "start"]
