import { inject, injectable } from 'inversify'
import { IQuery } from '../port/query.interface'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IInstitutionRepository } from '../port/institution.repository.interface'
import { ValidationException } from '../domain/exception/validation.exception'
import { Strings } from '../../utils/strings'
import { UserType } from '../domain/model/user'
import { IHealthProfessionalService } from '../port/health.professional.service.interface'
import { IHealthProfessionalRepository } from '../port/health.professional.repository.interface'
import { HealthProfessional } from '../domain/model/health.professional'
import { HealthProfessionalValidator } from '../domain/validator/health.professional.validator'

/**
 * Implementing Health Professional Service.
 *
 * @implements {IHealthProfessionalService}
 */
@injectable()
export class HealthProfessionalService implements IHealthProfessionalService {

    constructor(
        @inject(Identifier.HEALTH_PROFESSIONAL_REPOSITORY) private readonly _healthProfessionalRepository:
            IHealthProfessionalRepository,
        @inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
    }

    public async add(healthProfessional: HealthProfessional): Promise<HealthProfessional> {
        HealthProfessionalValidator.validate(healthProfessional)

        try {
            const healthProfessionalExist = await this._healthProfessionalRepository.checkExist(healthProfessional)
            if (healthProfessionalExist) throw new ConflictException(Strings.HEALTH_PROFESSIONAL.ALREADY_REGISTERED)

            // Checks if the institution exists.
            if (healthProfessional.institution && healthProfessional.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(healthProfessional.institution)
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

        return this._healthProfessionalRepository.create(healthProfessional)
    }

    public async getAll(query: IQuery): Promise<Array<HealthProfessional>> {
        query.addFilter({ type: UserType.HEALTH_PROFESSIONAL })
        return this._healthProfessionalRepository.find(query)
    }

    public async getById(id: string | number, query: IQuery): Promise<HealthProfessional> {
        query.addFilter({ _id: id, type: UserType.HEALTH_PROFESSIONAL })
        return this._healthProfessionalRepository.findOne(query)
    }

    public async update(healthProfessional: HealthProfessional): Promise<HealthProfessional> {
        try {
            // Checks if the institution exists.
            if (healthProfessional.institution && healthProfessional.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(healthProfessional.institution)
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

        return this._healthProfessionalRepository.update(healthProfessional)
    }

    public async remove(id: string | number): Promise<boolean> {
        return this._healthProfessionalRepository.delete(id)
    }
}
