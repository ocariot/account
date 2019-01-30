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

/**
 * Implementation of the service for user of type Application.
 *
 * @implements {IApplicationService}
 */
@injectable()
export class ApplicationService implements IApplicationService {

    constructor(@inject(Identifier.APPLICATION_REPOSITORY) private readonly _applicationRepository: IApplicationRepository,
                @inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
                @inject(Identifier.LOGGER) readonly logger: ILogger) {
    }

    public async add(application: Application): Promise<Application> {
        CreateApplicationValidator.validate(application)

        try {
            // 1. Checks if Application already exists.
            const applicationExist = await this._applicationRepository.checkExist(application)
            if (applicationExist) throw new ConflictException(Strings.APPLICATION.ALREADY_REGISTERED)

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

        // 3. Create new Application register
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
        UpdateUserValidator.validate(application)

        try {
            // 1. Checks if the institution exists.
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

        // 2. Update Application data.
        return this._applicationRepository.update(application)
    }

    public async remove(id: string): Promise<boolean> {
        return this._applicationRepository.delete(id)
    }
}
