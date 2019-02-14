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

/**
 * Implementing Institution Service.
 *
 * @implements {IInstitutionService}
 */
@injectable()
export class InstitutionService implements IInstitutionService {

    constructor(@inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
                @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
                @inject(Identifier.LOGGER) readonly logger: ILogger) {
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

    public async getById(id: string | number, query: IQuery): Promise<Institution> {
        query.filters = { _id: id }
        return this._institutionRepository.findOne(query)
    }

    public async update(institution: Institution): Promise<Institution> {
        return this._institutionRepository.update(institution)
    }

    public async remove(id: string): Promise<boolean> {
        try {
            // 1. Checks if Institution is associated with one or more users.
            const hasInstitution = await this._userRepository.hasInstitution(id)
            if (hasInstitution) throw new ValidationException(Strings.INSTITUTION.HAS_ASSOCIATION)
        } catch (err) {
            return Promise.reject(err)
        }

        // 2. Delete the Institution by id.
        return this._institutionRepository.delete(id)
    }
}
