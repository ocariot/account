import { inject, injectable } from 'inversify'
import { IQuery } from '../port/query.interface'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IInstitutionService } from '../port/institution.service.interface'
import { IInstitutionRepository } from '../port/institution.repository.interface'
import { Institution } from '../domain/model/institution'
import { CreateInstitutionValidator } from '../domain/validator/create.institution.validator'
import { Strings } from '../../utils/strings'
import { IUserRepository } from '../port/user.repository.interface'
import { ValidationException } from '../domain/exception/validation.exception'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { InstitutionEvent } from '../integration-event/event/institution.event'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { IntegrationEvent } from '../integration-event/event/integration.event'
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'

/**
 * Implementing Institution Service.
 *
 * @implements {IInstitutionService}
 */
@injectable()
export class InstitutionService implements IInstitutionService {

    constructor(@inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
                @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
                @inject(Identifier.INTEGRATION_EVENT_REPOSITORY) private readonly _integrationEventRepository:
                    IIntegrationEventRepository,
                @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                @inject(Identifier.LOGGER) private readonly _logger: ILogger) {
    }

    public async add(institution: Institution): Promise<Institution> {

        try {
            // 1. Validate Institution parameters
            CreateInstitutionValidator.validate(institution)

            // 2. Checks if Institution already exists.
            const institutionExist = await this._institutionRepository.checkExist(institution)
            if (institutionExist) throw new ConflictException(Strings.INSTITUTION.ALREADY_REGISTERED)
        } catch (err) {
            return Promise.reject(err)
        }

        // 3. Create new Institution register.
        return this._institutionRepository.create(institution)
    }

    public async getAll(query: IQuery): Promise<Array<Institution>> {
        return this._institutionRepository.find(query)
    }

    public async getById(id: string, query: IQuery): Promise<Institution> {
        // 1. Validate id.
        ObjectIdValidator.validate(id)

        // 2. Get a institution.
        query.filters = { _id: id }
        return this._institutionRepository.findOne(query)
    }

    public async update(institution: Institution): Promise<Institution> {
        // 1. Validate id.
        if (institution.id) ObjectIdValidator.validate(institution.id)

        // 2. Update a institution.
        return this._institutionRepository.update(institution)
    }

    public async remove(id: string): Promise<boolean> {
        try {
            // 1. Validate id.
            ObjectIdValidator.validate(id)

            // 2. Checks if Institution is associated with one or more users.
            const hasInstitution = await this._userRepository.hasInstitution(id)
            if (hasInstitution) throw new ValidationException(Strings.INSTITUTION.HAS_ASSOCIATION)

            // 3. Create a Institution with only one attribute, the id to be used in publishing on the event bus
            const institutionToBeDeleted: Institution = new Institution()
            institutionToBeDeleted.id = id

            // 4. Delete the Institution by id.
            const wasDeleted: boolean = await this._institutionRepository.delete(id)

            // 5. If deleted successfully, the object is published on the message bus.
            if (wasDeleted) {
                const event: InstitutionEvent = new InstitutionEvent('InstitutionDeleteEvent',
                    new Date(), institutionToBeDeleted)
                if (!(await this._eventBus.publish(event, 'institutions.delete'))) {
                    // 6. Save Event for submission attempt later when there is connection to message channel.
                    this.saveEvent(event)
                } else {
                    this._logger.info(`Institution with ID: ${institutionToBeDeleted.id} was deleted...`)
                }

                // 5a. Returns true
                return Promise.resolve(true)
            }

            // 5b. Returns false
            return Promise.resolve(false)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Saves the event to the database.
     * Useful when it is not possible to run the event and want to perform the
     * operation at another time.
     * @param event
     */
    private saveEvent(event: IntegrationEvent<Institution>): void {
        const saveEvent: any = event.toJSON()
        saveEvent.__operation = 'publish'
        if (event.event_name === 'InstitutionEvent') saveEvent.__routing_key = 'institutions.delete'
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
