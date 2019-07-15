FROM node:10.15.3

ENV NODE_ENV=${NODE_ENV:-development}

# Create app directory
RUN mkdir -p /usr/src/ac
WORKDIR /usr/src/ac

# Install app dependencies
COPY package.json /usr/src/ac/
RUN npm install

# Bundle app source
COPY . /usr/src/ac

RUN chmod +x ./create-self-signed-certs.sh
RUN ./create-self-signed-certs.sh
RUN npm run build

# Environment variables
ENV PORT_HTTP=${PORT_HTTP:-3000}
ENV PORT_HTTPS=${PORT_HTTPS:-3001}
ENV HOST_WHITELIST=${HOST_WHITELIST:-[*]}
ENV SSL_KEY_PATH=${SSL_KEY_PATH:-.certs/server.key}
ENV SSL_CERT_PATH=${SSL_CERT_PATH:-.certs/server.crt}
ENV JWT_PRIVATE_KEY_PATH=${JWT_PRIVATE_KEY_PATH:-.certs/jwt.key}
ENV JWT_PUBLIC_KEY_PATH=${JWT_PUBLIC_KEY_PATH:-.certs/jwt.key.pub}
ENV ISSUER=${JWT_ISSUER:-ocariot}
ENV ADMIN_USERNAME=${ADMIN_USER:-admin}
ENV ADMIN_PASSWORD=${ADMIN_PASS:-admin}
ENV RABBITMQ_URI="${RABBITMQ_URI:-amqp://guest:guest@127.0.0.1:5672/ocariot}"
ENV MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1/ocariot-account}"

EXPOSE $PORT_HTTP
EXPOSE $PORT_HTTPS

CMD ["npm", "start"]
