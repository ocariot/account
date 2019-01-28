import { inject, injectable } from 'inversify'
import { IChildService } from '../port/child.service.interface'
import { Child } from '../domain/model/child'
import { IQuery } from '../port/query.interface'
import { Identifier } from '../../di/identifiers'
import { IChildRepository } from '../port/child.repository.interface'
import { ILogger } from '../../utils/custom.logger'
import { ChildValidator } from '../domain/validator/child.validator'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IInstitutionRepository } from '../port/institution.repository.interface'
import { Default } from '../../utils/default'
import { ValidationException } from '../domain/exception/validation.exception'

/**
 * Implementing child Service.
 *
 * @implements {IChildService}
 */
@injectable()
export class ChildService implements IChildService {

    constructor(@inject(Identifier.CHILD_REPOSITORY) private readonly _childRepository: IChildRepository,
                @inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
                @inject(Identifier.LOGGER) readonly logger: ILogger) {
    }

    public async add(child: Child): Promise<Child> {
        ChildValidator.validate(child)

        try {
            const childExist = await this._childRepository.checkExist(child)
            if (childExist) throw new ConflictException(Default.VALIDATION_CHILD.CHILD_ALREADY_REGISTERED)

            // Checks if the institution exists.
            if (child.institution && child.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(child.institution)
                if (!institutionExist) {
                    throw new ValidationException(
                        Default.VALIDATION_INSTITUTION.REGISTER_REQUIRED,
                        Default.VALIDATION_INSTITUTION.ALERT_REGISTER_REQUIRED
                    )
                }
            }

        } catch (err) {
            return Promise.reject(err)
        }

        return this._childRepository.create(child)
    }

    public async getAll(query: IQuery): Promise<Array<Child>> {
        return this._childRepository.find(query)
    }

    public async getById(id: string | number, query: IQuery): Promise<Child> {
        query.filters = { _id: id }
        return this._childRepository.findOne(query)
    }

    public async update(child: Child): Promise<Child> {
        try {
            // Checks if the institution exists.
            if (child.institution && child.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(child.institution)
                if (!institutionExist) {
                    throw new ValidationException(
                        Default.VALIDATION_INSTITUTION.REGISTER_REQUIRED,
                        Default.VALIDATION_INSTITUTION.ALERT_REGISTER_REQUIRED
                    )
                }
            }
        } catch (err) {
            return Promise.reject(err)
        }

        return this._childRepository.update(child)
    }

    public async remove(id: string | number): Promise<boolean> {
        return this._childRepository.delete(id)
    }
}