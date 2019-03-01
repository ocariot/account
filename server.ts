import dotenv from 'dotenv'
import http from 'http'
import https from 'https'
import { Application } from 'express'
import { Identifier } from './src/di/identifiers'
import { DI } from './src/di/di'
import { ILogger } from './src/utils/custom.logger'
import { BackgroundService } from './src/background/background.service'
import { Default } from './src/utils/default'
import { App } from './src/app'
import { readFileSync } from 'fs'
import * as fs from 'fs'

/* Load environment variables. */
dotenv.load()

const logger: ILogger = DI.getInstance().getContainer().get<ILogger>(Identifier.LOGGER)
const app: Application = (DI.getInstance().getContainer().get<App>(Identifier.APP)).getExpress()
const backgroundServices: BackgroundService = DI.getInstance().getContainer().get(Identifier.BACKGROUND_SERVICE)
const port_http = process.env.PORT_HTTP || Default.PORT_HTTP
const port_https = process.env.PORT_HTTPS || Default.PORT_HTTPS
const https_options = {
    key: readFileSync(process.env.PRIVATE_KEY_CERT_PATH || Default.PRIVATE_KEY_CERT_PATH),
    cert: readFileSync(process.env.CERT_PATH || Default.CERT_PATH)
}
/* Create certificates (JWT public key) directory if it doesn't exists */
const cert_dir_path = process.env.CERT_DIR_PATH || Default.CERT_DIR_PATH

/*Create the certificates dir if it doesn't exist */
if (!fs.existsSync(cert_dir_path)) {
    fs.mkdirSync(cert_dir_path)
}

/**
 * Initializes HTTP server and redirects accesses to HTTPS.
 */
http.createServer((req, res) => {
    const host = req.headers.host || ''
    const newLocation = 'https://' + host.replace(/:\d+/, ':' + port_https) + req.url
    res.writeHead(301, { Location: newLocation })
    res.end()
}).listen(port_http)

/**
 * Initializes HTTPS server.
 * After the successful startup, listener is initialized
 * for important events and background services.
 */
https.createServer(https_options, app)
    .listen(port_https, () => {
        initListener()
        backgroundServices.startServices()
            .then(() => {
                logger.info('Initialized background services.')
            })
        logger.debug(`Server HTTPS running on port ${port_https}`)
    })

/**
 * Function to listen to the SIGINT event and end services
 * in the background, when the respective event is triggered.
 */
function initListener(): void {
    process.on('SIGINT', () => {
        backgroundServices.stopServices()
            .then(() => {
                logger.info('Stopped background services.')
            })
        process.exit()
    })
}
