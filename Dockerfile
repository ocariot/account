FROM node

# Create app directory
RUN mkdir -p /usr/src/ac
WORKDIR /usr/src/ac

# Install app dependencies
COPY package.json /usr/src/ac/
RUN npm install

# Copy app source
COPY . /usr/src/ac

# Create self-signed certificates
RUN chmod +x ./create-self-signed-certs.sh
RUN ./create-self-signed-certs.sh

# Build app
RUN npm run build

EXPOSE 3000
EXPOSE 3001

CMD ["npm", "start"]
