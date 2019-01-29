import { inject, injectable } from 'inversify'
import { IQuery } from '../port/query.interface'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IInstitutionRepository } from '../port/institution.repository.interface'
import { ValidationException } from '../domain/exception/validation.exception'
import { Strings } from '../../utils/strings'
import { UserType } from '../domain/model/user'
import { IEducatorService } from '../port/educator.service.interface'
import { IEducatorRepository } from '../port/educator.repository.interface'
import { Educator } from '../domain/model/educator'
import { EducatorValidator } from '../domain/validator/educator.validator'

/**
 * Implementing educator Service.
 *
 * @implements {IEducatorService}
 */
@injectable()
export class EducatorService implements IEducatorService {

    constructor(@inject(Identifier.EDUCATOR_REPOSITORY) private readonly _educatorRepository: IEducatorRepository,
                @inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
                @inject(Identifier.LOGGER) readonly logger: ILogger) {
    }

    public async add(educator: Educator): Promise<Educator> {
        EducatorValidator.validate(educator)

        try {
            const educatorExist = await this._educatorRepository.checkExist(educator)
            if (educatorExist) throw new ConflictException(Strings.EDUCATOR.ALREADY_REGISTERED)

            // Checks if the institution exists.
            if (educator.institution && educator.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(educator.institution)
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

        return this._educatorRepository.create(educator)
    }

    public async getAll(query: IQuery): Promise<Array<Educator>> {
        query.addFilter({ type: UserType.EDUCATOR })
        return this._educatorRepository.find(query)
    }

    public async getById(id: string | number, query: IQuery): Promise<Educator> {
        query.addFilter({ _id: id, type: UserType.EDUCATOR })
        return this._educatorRepository.findOne(query)
    }

    public async update(educator: Educator): Promise<Educator> {
        try {
            // Checks if the institution exists.
            if (educator.institution && educator.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(educator.institution)
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

        return this._educatorRepository.update(educator)
    }

    public async remove(id: string | number): Promise<boolean> {
        return this._educatorRepository.delete(id)
    }
}
