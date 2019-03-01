# Account Service
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://opensource.org/licenses/MIT) [![node](https://img.shields.io/badge/node-v8.11.2-red.svg)](https://nodejs.org/) [![npm](https://img.shields.io/badge/npm-v5.5.1-red.svg)](https://nodejs.org/) [![swagger](https://img.shields.io/badge/swagger-v2.0-green.svg)](https://swagger.io/) [![TypeScript](https://badges.frapsoft.com/typescript/love/typescript.png?v=101)](https://www.typescriptlang.org/) 
--
User management service.

## Pre Installation
1. The microservice runs on HTTPS, so it is necessary to generate the private key and certificate. In the development and testing environment, you must use a self-signed certificate. You can do this as you wish, if you prefer, check the following links that will help you create the necessary files (file.key and file.crt).
    - [Creating a Self-Signed SSL Certificate](https://pages.github.com/https://devcenter.heroku.com/articles/ssl-certificate-self).
    - [Self-Signed Certificate Generator](http://www.selfsignedcertificate.com/).
    
    **NOTE:** For the production environment, do not use self-signed certificates, but certificates provided by certification authorities.

2. Create a `cert` directory in the project root and save the files generated in step 1 to this directory, the directory will already be in .gitignore. Therefore, it will not be shared. 
   
3. Make a copy of the ".env.example" file, naming to .env. After that, open and edit the settings as needed.

## Installation and Development Server
Requires [Node.js](https://nodejs.org/) v8+ and [MongoDB](https://www.mongodb.com) to run.
Install the dependencies, start the local MongoDB, and start the server.

```sh
$ npm install
$ mongod
$ npm run start:dev
```
Navigate to `http://127.0.0.1:5000`.

## Build
- Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Run Server
- Run `npm start` to run the project in production mode.
- Run `npm run start:dev` to run the project in development mode. Code changes are automatically identified and rebuild is performed.
- Run `npm run build && npm start` Perform the build and initialize the microservice. **Useful for production/deployment.**

## Running unit tests
- Run `npm run test:unit` to run unit tests by [Mocha](https://mochajs.org/).

## Running integration tests
- Run `mongod`
- Run `npm run test:integration` to run integration tests by [Mocha](https://mochajs.org/).

## Running test coverage
- Run `npm run test:cov` to run code coverage tests by [Instanbul](https://istanbul.js.org/).

## Running all tests
- Run `mongod`
- Run `npm run test` to run unit testing, integration and coverage by [Mocha](https://mochajs.org/) and [Instanbul](https://istanbul.js.org/).

## Generating code documentation
- Run `npm run build:doc` the html documentation will be generated in the /docs directory by [typedoc](https://typedoc.org/).
