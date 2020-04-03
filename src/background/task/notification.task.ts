import { IBackgroundTask } from '../../application/port/background.task.interface'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { ILogger } from '../../utils/custom.logger'
import cron from 'cron'
import { Default } from '../../utils/default'
import { IChildRepository } from '../../application/port/child.repository.interface'
import { Child } from '../../application/domain/model/child'

@injectable()
export class NotificationTask implements IBackgroundTask {
    private job: any
    private numberOfDays: number = Number(process.env.NUMBER_OF_DAYS) || Default.NUMBER_OF_DAYS

    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.CHILD_REPOSITORY) private readonly _childRepository: IChildRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this.job = new cron.CronJob(`${process.env.EXPRESSION_AUTO_NOTIFICATION || Default.EXPRESSION_AUTO_NOTIFICATION}`,
            () => this.checkInactivity())
    }

    public run(): void {
        this.job.start()
        this._logger.debug('Notification task started successfully!')
    }

    public stop(): Promise<void> {
        this.job.stop()
        return this._eventBus.dispose()
    }

    private sendNotification(children: Array<Child>): void {
        try {
            for (const child of children) {
                this._logger.info(`OCARIoT has not received new data from ${child.username} in the last `
                    .concat(`${this.numberOfDays} days!`))
            }
        } catch (err) {
            this._logger.error(`An error occurred while trying to send a notification. ${err.message}`)
        }
    }

    private checkInactivity(): void {
        this._childRepository.findByLastSync(this.numberOfDays)
            .then(result => {
                if (result.length) this.sendNotification(result)
            })
            .catch(err => {
                this._logger.error(`An error occurred while trying to retrieve Child data. ${err.message}`)
            })
    }
}
