import { Container, inject, injectable } from 'inversify'
import { Identifier } from '../di/identifiers'
import { IDBConnection } from '../infrastructure/port/db.connection.interface'
import { IEventBus } from '../infrastructure/port/event.bus.interface'
import { CustomLogger } from '../utils/custom.logger'
import { RegisterDefaultAdminTask } from './task/register.default.admin.task'
import { DI } from '../di/di'
import { GenerateJwtKeysTask } from './task/generate.jwt.keys.task'

@injectable()
export class BackgroundService {
    private readonly _diContainer: Container

    constructor(
        @inject(Identifier.MONGODB_CONNECTION) private readonly _mongodb: IDBConnection,
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.LOGGER) private readonly _logger: CustomLogger
    ) {
        this._diContainer = DI.getInstance().getContainer()
    }

    public async startServices(): Promise<void> {
        this._logger.debug('startServices()')
        try {
            /**
             * At the time the application goes up, an event is issued if the
             * database is connected, and in this case, a task is run to check
             * if there are registered admin users.
             */
            await this._mongodb.eventConnection.on('connected', () => {
                new RegisterDefaultAdminTask(this._diContainer.get(Identifier.USER_REPOSITORY), this._logger).run()
            })

            await this._mongodb.tryConnect() // Initialize mongodb

            /**
             * Register your events using the event bus instance here.
             */

            /** Create JWT Keys task. */
            await new GenerateJwtKeysTask(this._logger).generateKeys()
        } catch (err) {
            this._logger.error(`Error initializing services in background: ${err.message}`)
        }
    }

    public async stopServices(): Promise<void> {
        this._logger.debug('stopServices()')

        try {
            await this._eventBus.dispose()
            await this._mongodb.dispose()
        } catch (err) {
            this._logger.error(`Error stopping background services: ${err.message}`)
        }
    }
}
