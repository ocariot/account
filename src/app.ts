import logger from 'morgan'
import bodyParser from 'body-parser'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import routes from './routes'
import express, { Application, Request, Response, NextFunction } from "express"
import { ApiException, IExceptionError } from './exceptions/api.exception'
import qs from 'query-strings-parser'
import config from '../config/config';
import { tryConnect } from '../config/database';

/**
 * Class App.
 * 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
class App {
    private app: Application
    private database: any

    /**
     * Class constructor.
     */
    constructor() {
        this.app = express()
        this.bootstrap()
    }

    /**
     * Get express instance.
     * 
     * @returns Application
     */
    getExpress(): Application {
        return this.app
    }

    /**
     * Bootstrap app.
     */
    bootstrap(): void {
        tryConnect()
        this.middlewares()
        this.routes()
    }

    /**
     * Initialize middlewares.
     * 
     * @returns void
     */
    private middlewares(): void {
        let env = process.env.NODE_ENV || config.NODE_ENV

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.app.use(qs({ use_page: true, default: { pagination: { limit: 20 }, sort: { created_at: 'desc' } } }))

        /**
         * Middleware swagger. It should not run in the test environment.
         */
        if (env != undefined && env.trim() != 'test') {
            let options = {
                customCss: '.swagger-ui .topbar { display: none }',
                customfavIcon: 'http://nutes.uepb.edu.br/wp-content/uploads/2014/01/icon.fw_.png',
                customSiteTitle: `API Reference | Account Service`
            }

            this.app.use('/api/v1/reference', swaggerUi.serve, swaggerUi.setup(
                yaml.load('./src/swagger/swagger.yaml'), options)
            )
        }
    }

    /**
     * Initializes as routes available in the application.
     * 
     * @returns void
     */
    private routes(): void {
        this.app.use('/', routes)

        // Handle 404
        this.app.use((req: Request, res: Response) => {
            let errorMessage: IExceptionError = new ApiException(404, `${req.url} not found.`,
                `Specified resource: ${req.url} was not found or does not exist.`)

            res.status(404).send(errorMessage.toJson())
        });

        // Handle 500
        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            let errorMessage: IExceptionError = new ApiException(err.code, err.message, err.description)
            res.status(500).send(errorMessage.toJson())
        });
    }
}

export default new App()