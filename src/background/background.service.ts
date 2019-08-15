import { inject, injectable } from 'inversify'
import { Identifier } from '../di/identifiers'
import { IConnectionDB } from '../infrastructure/port/connection.db.interface'
import { IBackgroundTask } from '../application/port/background.task.interface'
import { RegisterDefaultAdminTask } from './task/register.default.admin.task'
import { DIContainer } from '../di/di'

@injectable()
export class BackgroundService {

    constructor(
        @inject(Identifier.MONGODB_CONNECTION) private readonly _mongodb: IConnectionDB,
        @inject(Identifier.EVENT_BUS_TASK) private readonly _eventBusTask: IBackgroundTask,
        @inject(Identifier.GENERATE_JWT_KEYS_TASK) private readonly _generateJwtKeysTask: IBackgroundTask
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
                DIContainer.get(Identifier.LOGGER)
            ).run()

            /**
             * Trying to connect to mongodb.
             * Go ahead only when the run is resolved.
             * Since the application depends on the database connection to work.
             */
            await this._mongodb.tryConnect(0, 1000)

            /**
             * Perform task responsible for signature and event publishing routines,
             * which for some reason could not be sent and saved for later submission.
             */
            this._eventBusTask.run()

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
            await this._eventBusTask.stop()
        } catch (err) {
            return Promise.reject(new Error(`Error stopping MongoDB! ${err.message}`))
        }
    }
}
