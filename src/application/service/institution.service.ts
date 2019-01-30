import { inject, injectable } from 'inversify'
import { IQuery } from '../port/query.interface'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IInstitutionService } from '../port/institution.service.interface'
import { IInstitutionRepository } from '../port/institution.repository.interface'
import { Institution } from '../domain/model/institution'
import { InstitutionValidator } from '../domain/validator/institution.validator'
import { Strings } from '../../utils/strings'

/**
 * Implementing Institution Service.
 *
 * @implements {IInstitutionService}
 */
@injectable()
export class InstitutionService implements IInstitutionService {

    constructor(@inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
                @inject(Identifier.LOGGER) readonly logger: ILogger) {
    }

    public async add(institution: Institution): Promise<Institution> {
        InstitutionValidator.validate(institution)

        try {
            // 1. Checks if Institution already exists.
            const institutionExist = await this._institutionRepository.checkExist(institution)
            if (institutionExist) throw new ConflictException(Strings.INSTITUTION.ALREADY_REGISTERED)
        } catch (err) {
            return Promise.reject(err)
        }

        // 2. Create new Institution register.
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

    public async remove(id: string | number): Promise<boolean> {
        return this._institutionRepository.delete(id)
    }
}
