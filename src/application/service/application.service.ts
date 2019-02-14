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

/**
 * Implementation of the service for user of type Application.
 *
 * @implements {IApplicationService}
 */
@injectable()
export class ApplicationService implements IApplicationService {

    constructor(@inject(Identifier.APPLICATION_REPOSITORY) private readonly _applicationRepository: IApplicationRepository,
                @inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
                @inject(Identifier.LOGGER) readonly logger: ILogger,
                @inject(Identifier.RABBITMQ_EVENT_BUS) readonly _eventBus: IEventBus) {
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

    public async getById(id: string | number, query: IQuery): Promise<Application> {
        query.addFilter({ _id: id, type: UserType.APPLICATION })
        return this._applicationRepository.findOne(query)
    }

    public async update(application: Application): Promise<Application> {

        try {
            // 1. Validate Application parameters.
            UpdateUserValidator.validate(application)

            // 2. Checks if the institution exists.
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

        // 3. Update Application data.
        const applicationUp = await this._applicationRepository.update(application)

        // 4. Publish updated application data.
        if (applicationUp) {
            const event = new UserUpdateEvent<Application>(
                'ApplicationUpdateEvent', new Date(), applicationUp)
            this._eventBus.publish(event, 'applications.update')

        }

        return applicationUp
    }

    public async remove(id: string): Promise<boolean> {
        return this._applicationRepository.delete(id)
    }
}
