import { inject, injectable } from 'inversify'
import { IQuery } from '../port/query.interface'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IInstitutionRepository } from '../port/institution.repository.interface'
import { ValidationException } from '../domain/exception/validation.exception'
import { IApplicationService } from '../port/application.service.interface'
import { IApplicationRepository } from '../port/application.repository.interface'
import { Application } from '../domain/model/application'
import { CreateApplicationValidator } from '../domain/validator/create.application.validator'
import { Strings } from '../../utils/strings'
import { UserType } from '../domain/model/user'
import { UpdateUserValidator } from '../domain/validator/update.user.validator'
import { UserUpdateEvent } from '../integration-event/event/user.update.event'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'

/**
 * Implementation of the service for user of type Application.
 *
 * @implements {IApplicationService}
 */
@injectable()
export class ApplicationService implements IApplicationService {

    constructor(@inject(Identifier.APPLICATION_REPOSITORY) private readonly _applicationRepository: IApplicationRepository,
                @inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
                @inject(Identifier.INTEGRATION_EVENT_REPOSITORY)
                private readonly _integrationEventRepository: IIntegrationEventRepository,
                @inject(Identifier.LOGGER) private readonly _logger: ILogger,
                @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus) {
    }

    public async add(application: Application): Promise<Application> {
        try {
            // 1. Validate Application parameters.
            CreateApplicationValidator.validate(application)

            // 2. Checks if Application already exists.
            const applicationExist = await this._applicationRepository.checkExist(application)
            if (applicationExist) throw new ConflictException(Strings.APPLICATION.ALREADY_REGISTERED)

            // 3. Checks if the institution exists.
            if (application.institution && application.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(application.institution)
                if (!institutionExist) {
                    throw new ValidationException(
                        Strings.INSTITUTION.REGISTER_REQUIRED,
                        Strings.INSTITUTION.ALERT_REGISTER_REQUIRED
                    )
                }
            }
        } catch (err) {
            return Promise.reject(err)
        }

        // 4. Create new Application register
        return this._applicationRepository.create(application)
    }

    public async getAll(query: IQuery): Promise<Array<Application>> {
        query.addFilter({ type: UserType.APPLICATION })
        return this._applicationRepository.find(query)
    }

    public async getById(id: string, query: IQuery): Promise<Application> {
        // 1. Validate id.
        ObjectIdValidator.validate(id)

        // 2. Get a application.
        query.addFilter({ _id: id, type: UserType.APPLICATION })
        return this._applicationRepository.findOne(query)
    }

    public async update(application: Application): Promise<Application> {
        try {
            // 1. Validate Application parameters.
            UpdateUserValidator.validate(application)

            // 2. Checks if Application already exists.
            const id: string = application.id!
            application.id = undefined

            const applicationExist = await this._applicationRepository.checkExist(application)
            if (applicationExist) throw new ConflictException(Strings.APPLICATION.ALREADY_REGISTERED)

            application.id = id

            // 3. Checks if the institution exists.
            if (application.institution && application.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(application.institution)
                if (!institutionExist) {
                    throw new ValidationException(
                        Strings.INSTITUTION.REGISTER_REQUIRED,
                        Strings.INSTITUTION.ALERT_REGISTER_REQUIRED
                    )
                }
            }
        } catch (err) {
            return Promise.reject(err)
        }

        // 4. Update Application data.
        const applicationUp = await this._applicationRepository.update(application)

        // 5. If updated successfully, the object is published on the message bus.
        if (applicationUp) {
            const event = new UserUpdateEvent<Application>(
                'ApplicationUpdateEvent', new Date(), applicationUp)

            if (!(await this._eventBus.publish(event, 'applications.update'))) {
                // 5. Save Event for submission attempt later when there is connection to message channel.
                this.saveEvent(event)
            } else {
                this._logger.info(`User of type Application with ID: ${applicationUp.id} has been updated`
                    .concat(' and published on event bus...'))
            }
        }
        // 6. Returns the created object.
        return Promise.resolve(applicationUp)
    }

    public async remove(id: string): Promise<boolean> {
        // 1. Validate id.
        ObjectIdValidator.validate(id)

        // 2. Delete a application.
        return this._applicationRepository.delete(id)
    }

    /**
     * Saves the event to the database.
     * Useful when it is not possible to run the event and want to perform the
     * operation at another time.
     * @param event
     */
    private saveEvent(event: UserUpdateEvent<Application>): void {
        const saveEvent: any = event.toJSON()
        saveEvent.__operation = 'publish'
        saveEvent.__routing_key = 'applications.update'
        this._integrationEventRepository
            .create(JSON.parse(JSON.stringify(saveEvent)))
            .then(() => {
                this._logger.warn(`Could not publish the event named ${event.event_name}.`
                    .concat(` The event was saved in the database for a possible recovery.`))
            })
            .catch(err => {
                this._logger.error(`There was an error trying to save the name event: ${event.event_name}.`
                    .concat(`Error: ${err.message}. Event: ${JSON.stringify(saveEvent)}`))
            })
    }
}
