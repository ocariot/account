
# OCARIoT Account Service  
[![License][license-image]][license-url] [![Node][node-image]][node-url] [![Dependencies][dependencies-image]][dependencies-url] [![DependenciesDev][dependencies-dev-image]][dependencies-dev-url] [![Vulnerabilities][known-vulnerabilities-image]][known-vulnerabilities-url] [![Travis][travis-image]][travis-url] [![Coverage][coverage-image]][coverage-url]

Microservice responsible for user management and authentication on the OCARIoT platform.
  
## Prerequisites
- [Node 8.0.0+](https://nodejs.org/en/download/)
- [MongoDB Server 3.0.0+](https://www.mongodb.com/download-center/community)
- [RabbitMQ 3.7.0+](https://www.rabbitmq.com/download.html)

---

## Set the environment variables
Application settings are defined by environment variables.. To configure the settings, make a copy of the `.env.example` file, naming for `.env`. After that, open and edit the settings as needed. The following environments variables are available:
- `NODE_ENV` - Defines the environment in which the application runs. You can set:
  - `development` - execute the application in the development environment. In this environment, all log levels are enabled. **_it is default value_**;
  - `test` - execute the application in the test environment. In this environment, the database defined in `MONGODB_URI_TEST` is used and the logs are disabled for better visualization of the test output;
  - `production` - execute the application in production environment. In this environment, only the warning and error logs are enabled.
- `PORT_HTTP` - Port used to listen for HTTP requests. Any request received on this port is redirected to the HTTPS port. _**The default value is `3000`**._
- `PORT_HTTPS` - Port used to listen for HTTPS requests. _**The default value is `3001`**_. Do not forget to provide the private key and the SSL/TLS certificate. See the topic [generate certificates](https://github.com/ocariot/account-service#generate-certificates).
- `HOST_WHITELIST` - Access control based on IP addresses. Only allow IP requests in the unlock list. You can define IP or host, for example: `[127.0.0.1, api.ocariot.com]`. To accept requests from any customer, use the character `*`. _**The default value is `[*]`**_.
- `SSL_KEY_PATH` - SSL/TLS certificate private key. _**The default value is `.certs/server.key`**_.
- `SSL_CERT_PATH` - SSL/TLS certificate. _**The default value is `.certs/server.crt`**_.
- `JWT_PRIVATE_KEY_PATH` - Private key used to generate and validate JSON Web Token (JWT). _**The default value is `.certs/jwt.key`**_.
- `JWT_PUBLIC_KEY_PATH` - Public key used to generate and validate JSON Web Token (JWT). _**The default value is `.certs/jwt.key.pub`**_.
- `ISSUER` - Used to generate the JWT token. Usually it is the name of the platform. _**The default value is `ocariot`**_.
- `ADMIN_USERNAME` - The default user name of type administrator created automatically when the application is initialized. _**The default value is `admin`**_.
- `ADMIN_PASSWORD` - The default user password of the administrator type created automatically when the application is initialized. _**The default value is `admin`**_.
- `RABBITMQ_URI` - URI containing the parameters for connection to the message channel RabbitMQ. The [URI specifications ](https://www.rabbitmq.com/uri-spec.html) defined by RabbitMQ are accepted. For example: `amqp://user:pass@host:port/vhost`. _**The default value is `amqp://guest:guest@127.0.0.1:5672/ocariot`**_.
- `MONGODB_URI` - Database connection URI used if the application is running in development or production environment. The [URI specifications ](https://docs.mongodb.com/manual/reference/connection-string) defined by MongoDB are accepted. For example: `mongodb://user:pass@host:port/database?options`. _**The default value is `mongodb://127.0.0.1:27017/ocariot-account`**_.
- `MONGODB_URI_TEST` - Database connection URI used if the application is running in test environment. The [URI specifications ](https://docs.mongodb.com/manual/reference/connection-string) defined by MongoDB are accepted. For example: `mongodb://user:pass@host:port/database?options`. _**The default value is `mongodb://127.0.0.1:27017/ocariot-account-test`**_.

## Generate Certificates
For development and testing environments the easiest and fastest way is to generate your own self-signed certificates. These certificates can be used to encrypt data as well as certificates signed by a CA, but users will receive a warning that the certificate is not trusted for their computer or browser. Therefore, self-signed certificates should only be used in non-production environments, that is, development and testing environments. To do this, run the create-self-signed-certs.sh script in the root of the repository.
```sh
./create-self-signed-certs.sh
```
The following files will be created: `server.crt`, `server.key`, `ca.crt`, `jwt.key`, and `jwt.key.pub`.

In production environments its highly recommended to always use valid certificates and provided by a certificate authority (CA). A good option is [Let's Encrypt](https://letsencrypt.org)  which is a CA that provides  free certificates. The service is provided by the [Internet Security Research Group (ISRG)](https://www.abetterinternet.org/). The process to obtain the certificate is extremely simple, as it is only required to provide a valid domain and prove control over it. With Let's Encrypt, you do this by using software that uses the [ACME](https://ietf-wg-acme.github.io/acme/) protocol, which typically runs on your host. If you prefer, you can use the service provided by the [SSL For Free](https://www.sslforfree.com/)  website and follow the walkthrough. The service is free because the certificates are provided by Let's Encrypt, and it makes the process of obtaining the certificates less painful.


## Installation and Execution
#### 1. Install dependencies  
```sh  
npm install    
```
 
#### 2. Build  
Build the project. The build artifacts will be stored in the `dist/` directory.  
```sh  
npm run build    
```

### Run Server  
```sh  
npm start   
```
Build the project and initialize the microservice. **Useful for production/deployment.**  
```sh  
npm run build && npm start  
```
## Running the tests

#### All tests  
Run unit testing, integration and coverage by [Mocha](https://mochajs.org/) and [Instanbul](https://istanbul.js.org/).  
```sh  
npm test
```

#### Unit test
```sh  
npm run test:unit
```
  
#### Integration test
```sh  
npm run test:integration
```

#### Coverage  test
```sh  
npm run test:cov
```
Navigate to the `coverage` directory and open the `index.html` file in the browser to see the result. Some statistics are also displayed in the terminal.

### Generating code documentation  
```sh  
npm run build:doc
```
The html documentation will be generated in the /docs directory by [typedoc](https://typedoc.org/).

[//]: # (These are reference links used in the body of this note.)
[license-image]: https://img.shields.io/badge/license-Apache%202-blue.svg
[license-url]: https://github.com/ocariot/account-service/blob/master/LICENSE 
[node-image]: https://img.shields.io/badge/node-%3E%3D%208.0.0-brightgreen.svg
[node-url]: https://nodejs.org
[travis-image]: https://travis-ci.org/ocariot/account-service.svg?branch=master
[travis-url]: https://travis-ci.org/ocariot/account-service
[coverage-image]: https://coveralls.io/repos/github/ocariot/account-service/badge.svg
[coverage-url]: https://coveralls.io/github/ocariot/account-service?branch=master
[known-vulnerabilities-image]: https://snyk.io/test/github/ocariot/account-service/badge.svg
[known-vulnerabilities-url]: https://snyk.io/test/github/ocariot/account-service
[dependencies-image]: https://david-dm.org/ocariot/account-service.svg
[dependencies-url]: https://david-dm.org/ocariot/account-service
[dependencies-dev-image]: https://david-dm.org/ocariot/account-service/dev-status.svg
[dependencies-dev-url]: https://david-dm.org/ocariot/account-service?type=dev
