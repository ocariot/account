FROM node:10.15.3

# Create app directory
RUN mkdir -p /usr/src/ac
WORKDIR /usr/src/ac

# Install app dependencies
COPY package.json /usr/src/ac/
RUN npm install

# Bundle app source
COPY . /usr/src/ac
RUN npm run build

EXPOSE 3000
EXPOSE 3001

CMD ["npm", "start"]
