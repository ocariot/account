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
    private numberOfDays: number = Default.NUMBER_OF_DAYS

    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.CHILD_REPOSITORY) private readonly _childRepository: IChildRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this.job = new cron.CronJob(`${Default.EXPRESSION_AUTO_NOTIFICATION}`,
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
        for (const child of children) {
            this._eventBus.bus.pubSendNotification(this.buildNotification(child))
                .then(() => {
                    this._logger.info('\'monitoring:miss_child_data\' notification sent')
                })
                .catch(err => {
                    this._logger.error(`An error occurred while trying to send a notification about the Child with ID: `
                        .concat(`${child.id}. ${err.message}`))
                })
        }
    }

    private buildNotification(child: Child): any {
        try {
            const now = new Date()
            const last_sync: Date = child.last_sync!
            const diff = Math.abs(now.getTime() - last_sync.getTime())
            const calc_days_since = Math.trunc(diff / (1000 * 60 * 60 * 24))

            return {
                notification_type: 'monitoring:miss_child_data',
                id: child.id,
                days_since: calc_days_since
            }
        } catch (err) {
            this._logger.error(`An error occurred while trying to build the notification. ${err.message}`)
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
