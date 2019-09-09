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
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
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
                @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                @inject(Identifier.LOGGER) private readonly _logger: ILogger) {
    }

    public async add(application: Application): Promise<Application> {
        try {
            // 1. Validate Application parameters.
            CreateApplicationValidator.validate(application)

            // 1.5 Ignore last_login attribute if exists.
            if (application.last_login) application.last_login = undefined

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
        ObjectIdValidator.validate(id, Strings.APPLICATION.PARAM_ID_NOT_VALID_FORMAT)

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
            this._eventBus.bus
                .pubUpdateApplication(applicationUp)
                .then(() => {
                    this._logger.info(`User of type Application with ID: ${applicationUp.id} has been updated`
                        .concat(' and published on event bus...'))
                })
                .catch((err) => {
                    this._logger.error(`Error trying to publish event UpdateApplication. ${err.message}`)
                })
        }
        // 6. Returns the created object.
        return Promise.resolve(applicationUp)
    }

    public async remove(id: string): Promise<boolean> {
        // 1. Validate id.
        ObjectIdValidator.validate(id, Strings.APPLICATION.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Delete a application.
        return this._applicationRepository.delete(id)
    }

    public count(): Promise<number> {
        return this._applicationRepository.count()
    }
}
