import { inject, injectable } from 'inversify'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { fitbitLastSyncEventHandler } from '../../application/integration-event/handler/fitbit.last.sync.event.handler'
import { ILogger } from '../../utils/custom.logger'

@injectable()
export class SubscribeEventBusTask implements IBackgroundTask {

    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public run(): void {
        this.initializeSubscribe()
    }

    public stop(): Promise<void> {
        return this._eventBus.dispose()
    }

    /**
     * Subscribe for all events.
     */
    private initializeSubscribe(): void {
        this._eventBus.bus
            .subFitbitLastSync(fitbitLastSyncEventHandler)
            .then(() => this._logger.info('Subscribe in FitbitLastSyncEvent successful!'))
            .catch((err) => this._logger.error(`Error trying to subscribe to FitbitLastSyncEvent: ${err.message}`))
    }
}
