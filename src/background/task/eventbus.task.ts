import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { ILogger } from '../../utils/custom.logger'
import { Query } from '../../infrastructure/repository/query/query'
import { IIntegrationEventRepository } from '../../application/port/integration.event.repository.interface'
import { IntegrationEvent } from '../../application/integration-event/event/integration.event'
import { UserDeleteEvent } from '../../application/integration-event/event/user.delete.event'
import { User } from '../../application/domain/model/user'
import { UserUpdateEvent } from '../../application/integration-event/event/user.update.event'
import { Child } from '../../application/domain/model/child'
import { Family } from '../../application/domain/model/family'
import { HealthProfessional } from '../../application/domain/model/health.professional'
import { Educator } from '../../application/domain/model/educator'
import { Application } from '../../application/domain/model/application'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { InstitutionEvent } from '../../application/integration-event/event/institution.event'
import { Institution } from '../../application/domain/model/institution'

@injectable()
export class EventBusTask implements IBackgroundTask {
    // private readonly _diContainer: Container
    private handlerPub: any

    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.INTEGRATION_EVENT_REPOSITORY)
        private readonly _integrationEventRepository: IIntegrationEventRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        // this._diContainer = IoC.getInstance().getContainer()
        this._eventBus.enableLogger(true)
    }

    public run(): void {
        this.subscribeEvents()
        this.publishSavedEvents()
    }

    public async stop(): Promise<void> {
        try {
            await this._eventBus.dispose()
            if (this.handlerPub) clearInterval(this.handlerPub)
        } catch (err) {
            return Promise.reject(new Error(`Error stopping EventBusTask! ${err.message}`))
        }
    }

    /**
     *  Before performing the subscribe is trying to connect to the bus.
     *  If there is no connection, infinite attempts will be made until
     *  the connection is established successfully. Once you have the
     *  connection, event registration is performed.
     */
    private subscribeEvents(): void {
        // Describes
    }

    /**
     * It publishes events, that for some reason could not
     * be sent and were saved for later submission.
     */
    private publishSavedEvents(): void {
        this._eventBus.connectionPub
            .tryConnect(0, 1500)
            .then(async () => {
                this._logger.info('Connection to publish established successfully!')
                await this.internalPublishSavedEvents(this.publishEvent, this._eventBus,
                    this._integrationEventRepository, this._logger)

                this.handlerPub = setInterval(this.internalPublishSavedEvents, 300000, // 5min
                    this.publishEvent,
                    this._eventBus,
                    this._integrationEventRepository,
                    this._logger)
            })
            .catch(err => {
                this._logger.error(`Error trying to get connection to Event Bus for event publishing. ${err.message}`)
            })
    }

    private async internalPublishSavedEvents(
        publishEvent: any, eventBus: IEventBus, integrationEventRepository: IIntegrationEventRepository,
        logger: ILogger): Promise<void> {
        if (!eventBus.connectionPub.isConnected) return

        try {
            const result: Array<any> = await integrationEventRepository.find(new Query())
            result.forEach((item: IntegrationEvent<any>) => {
                const event: any = item.toJSON()
                publishEvent(event, eventBus)
                    .then(pubResult => {
                        if (pubResult) {
                            logger.info(`Event with name ${event.event_name}, which was saved, `
                                .concat(`was successfully published to the event bus.`))
                            integrationEventRepository.delete(event.id)
                                .catch(err => {
                                    logger.error(`Error trying to remove saved event: ${err.message}`)
                                })
                        }
                    })
                    .catch(() => {
                        logger.error(`Error while trying to publish event saved with ID: ${event.id}`)
                    })
            })
        } catch (err) {
            logger.error(`Error retrieving saved events: ${err.message}`)
        }
    }

    private publishEvent(event: any, eventBus: IEventBus): Promise<boolean> {
        if (event.event_name === 'UserDeleteEvent') {
            const userDeleteEvent: UserDeleteEvent = new UserDeleteEvent(
                event.event_name,
                event.timestamp,
                new User().fromJSON(event.user)
            )
            return eventBus.publish(userDeleteEvent, event.__routing_key)
        } else if (event.event_name === 'ChildUpdateEvent') {
            const userChildUpdateEvent: UserUpdateEvent<Child> = new UserUpdateEvent(
                event.event_name,
                event.timestamp,
                new Child().fromJSON(event.child)
            )
            return eventBus.publish(userChildUpdateEvent, event.__routing_key)
        } else if (event.event_name === 'FamilyUpdateEvent') {
            const userFamilyUpdateEvent: UserUpdateEvent<Family> = new UserUpdateEvent(
                event.event_name,
                event.timestamp,
                new Family().fromJSON(event.family)
            )
            return eventBus.publish(userFamilyUpdateEvent, event.__routing_key)
        } else if (event.event_name === 'EducatorUpdateEvent') {
            const userEducatorUpdateEvent: UserUpdateEvent<Educator> = new UserUpdateEvent(
                event.event_name,
                event.timestamp,
                new Educator().fromJSON(event.educator)
            )
            return eventBus.publish(userEducatorUpdateEvent, event.__routing_key)
        } else if (event.event_name === 'HealthProfessionalUpdateEvent') {
            const userHealthProfessionalUpdateEvent: UserUpdateEvent<HealthProfessional> = new UserUpdateEvent(
                event.event_name,
                event.timestamp,
                new HealthProfessional().fromJSON(event.healthprofessional)
            )
            return eventBus.publish(userHealthProfessionalUpdateEvent, event.__routing_key)
        } else if (event.event_name === 'ApplicationUpdateEvent') {
            const userApplicationUpdateEvent: UserUpdateEvent<Application> = new UserUpdateEvent(
                event.event_name,
                event.timestamp,
                new Application().fromJSON(event.application)
            )
            return eventBus.publish(userApplicationUpdateEvent, event.__routing_key)
        } else if (event.event_name === 'InstitutionDeleteEvent') {
            const institutionDeleteEvent: InstitutionEvent = new InstitutionEvent(
                event.event_name,
                event.timestamp,
                new Institution().fromJSON(event.institution)
            )
            return eventBus.publish(institutionDeleteEvent, event.__routing_key)
        }
        return Promise.resolve(false)
    }
}
