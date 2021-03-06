import { inject, injectable } from 'inversify'
import { Identifier } from '../di/identifiers'
import { IBackgroundTask } from '../application/port/background.task.interface'
import { RegisterDefaultAdminTask } from './task/register.default.admin.task'
import { DIContainer } from '../di/di'
import { IDatabase } from '../infrastructure/port/database.interface'
import fs from 'fs'
import { IEventBus } from '../infrastructure/port/eventbus.interface'
import { Default } from '../utils/default'
import { ILogger } from '../utils/custom.logger'
import { IChildRepository } from '../application/port/child.repository.interface'
import { NotificationTask } from './task/notification.task'

@injectable()
export class BackgroundService {
    private _notificationTask: IBackgroundTask = new NotificationTask(
        this._eventBus, DIContainer.get<IChildRepository>(Identifier.CHILD_REPOSITORY), this._logger,
        Default.NUMBER_OF_DAYS, Default.EXPRESSION_AUTO_NOTIFICATION
    )

    constructor(
        @inject(Identifier.MONGODB_CONNECTION) private readonly _mongodb: IDatabase,
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.SUB_EVENT_BUS_TASK) private readonly _subscribeTask: IBackgroundTask,
        @inject(Identifier.PROVIDER_EVENT_BUS_TASK) private readonly _providerTask: IBackgroundTask,
        @inject(Identifier.GENERATE_JWT_KEYS_TASK) private readonly _generateJwtKeysTask: IBackgroundTask,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async startServices(): Promise<void> {
        try {
            /**
             * At the time the application goes up, an event is issued if the
             * database is connected, and in this case, a task is run to check
             * if there are registered admin users.
             */
            await new RegisterDefaultAdminTask(this._mongodb,
                DIContainer.get(Identifier.USER_REPOSITORY),
                this._logger
            ).run()

            // Trying to connect to mongodb.
            // Go ahead only when the run is resolved.
            // Since the application depends on the database connection to work.
            await this._mongodb.connect(this.getDBUri())

            // Initializes the instance to handle RabbitMQ.
            // Must be initialized only once!!!
            // To use SSL/TLS, simply mount the uri with the amqps protocol and pass the CA.
            const rabbitUri = process.env.RABBITMQ_URI || Default.RABBITMQ_URI
            const rabbitOptions: any = { sslOptions: { ca: [] } }
            if (rabbitUri.indexOf('amqps') === 0) {
                rabbitOptions.sslOptions.ca = [fs.readFileSync(process.env.RABBITMQ_CA_PATH || Default.RABBITMQ_CA_PATH)]
            }
            await this._eventBus.initialize(rabbitUri, rabbitOptions)
            this.initializeBusEvents()

            // Subscribe all resources
            this._subscribeTask.run()

            // All resource provider
            this._providerTask.run()

            // Notification task
            this._notificationTask.run()

            /**
             * Create keys fot JWT
             */
            await this._generateJwtKeysTask.run()
        } catch (err) {
            return Promise.reject(new Error(`Error initializing services in background! ${err.message}`))
        }
    }

    public async stopServices(): Promise<void> {
        try {
            await this._mongodb.dispose()
            await this._notificationTask.stop()
        } catch (err) {
            return Promise.reject(new Error(`Error stopping MongoDB! ${err.message}`))
        }
    }

    private initializeBusEvents(): void {
        this._eventBus.bus.on('sub_trying_connection', () => {
            this._logger.warn('Trying to reestablish Subscribe connection...')
        })

        this._eventBus.bus.on('sub_reconnected', () => {
            this._logger.warn('Subscribe connection successfully reconnected!')
        })

        this._eventBus.bus.on('pub_trying_connection', () => {
            this._logger.warn('Trying to reestablish Publish connection...')
        })

        this._eventBus.bus.on('pub_reconnected', () => {
            this._logger.warn('Publish connection successfully reconnected!')
        })

        this._eventBus.bus.on('rpc_server_trying_connection', () => {
            this._logger.warn('Trying to reestablish Provider (RPC Server) connection...')
        })

        this._eventBus.bus.on('rpc_server_reconnected', () => {
            this._logger.warn('Provider (RPC Server) connection successfully reconnected!')
        })
    }

    /**
     * Retrieve the URI for connection to MongoDB.
     *
     * @return {string}
     */
    private getDBUri(): string {
        if (process.env.NODE_ENV && process.env.NODE_ENV === 'test') {
            return process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST
        }
        return process.env.MONGODB_URI || Default.MONGODB_URI
    }
}
