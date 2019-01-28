import { inject, injectable } from 'inversify'
import { IQuery } from '../port/query.interface'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ConflictException } from '../domain/exception/conflict.exception'
import { ValidationException } from '../domain/exception/validation.exception'
import { IFamilyService } from '../port/family.service.interface'
import { Family } from '../domain/model/family'
import { FamilyValidator } from '../domain/validator/family.validator'
import { IFamilyRepository } from '../port/family.repository.interface'
import { Child } from '../domain/model/child'
import { IChildRepository } from '../port/child.repository.interface'
import { IInstitutionRepository } from '../port/institution.repository.interface'
import { Default } from '../../utils/default'

/**
 * Implementing family Service.
 *
 * @implements {IFamilyService}
 */
@injectable()
export class FamilyService implements IFamilyService {

    constructor(@inject(Identifier.FAMILY_REPOSITORY) private readonly _familyRepository: IFamilyRepository,
                @inject(Identifier.CHILD_REPOSITORY) private readonly _childRepository: IChildRepository,
                @inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
                @inject(Identifier.LOGGER) readonly logger: ILogger) {
    }

    public async add(family: Family): Promise<Family> {
        FamilyValidator.validate(family)

        try {
            // Checks if family already exists
            const familyExist = await this._familyRepository.checkExist(family)
            if (familyExist) throw new ConflictException('Family is already registered!')

            // Checks if the children to be associated have a record. Your registration is required.
            if (family.children) {
                const checkChildrenExist: boolean | ValidationException = await this._childRepository.checkExist(family.children)
                if (checkChildrenExist instanceof ValidationException) {
                    throw new ValidationException(
                        Default.VALIDATION_CHILD.CHILDREN_REGISTER_REQUIRED,
                        Default.VALIDATION_CHILD.IDS_WITHOUT_REGISTER.concat(' ').concat(checkChildrenExist.message)
                    )
                }
            }

            // Checks if the institution exists.
            if (family.institution && family.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(family.institution)
                if (!institutionExist) {
                    throw new ValidationException(
                        Default.VALIDATION_INSTITUTION.REGISTER_REQUIRED,
                        Default.VALIDATION_INSTITUTION.ALERT_REGISTER_REQUIRED
                    )
                }
            }
        } catch (err) {
            console.error('error', err.message)
            return Promise.reject(err)
        }

        return this._familyRepository.create(family)
    }

    public async getAll(query: IQuery): Promise<Array<Family>> {
        return this._familyRepository.find(query)
    }

    public async getById(id: string | number, query: IQuery): Promise<Family> {
        query.filters = { _id: id }
        return this._familyRepository.findOne(query)
    }

    public async update(family: Family): Promise<Family> {
        try {
            // Checks if the children to be associated have a record. Your registration is required.
            if (family.children) {
                const checkChildrenExist: boolean | ValidationException = await this._childRepository.checkExist(family.children)
                if (checkChildrenExist instanceof ValidationException) {
                    throw new ValidationException(
                        Default.VALIDATION_CHILD.CHILDREN_REGISTER_REQUIRED,
                        Default.VALIDATION_CHILD.IDS_WITHOUT_REGISTER.concat(' ').concat(checkChildrenExist.message)
                    )
                }
            }

            // Checks if the institution exists.
            if (family.institution && family.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(family.institution)
                if (!institutionExist) {
                    throw new ValidationException(
                        Default.VALIDATION_INSTITUTION.REGISTER_REQUIRED,
                        Default.VALIDATION_INSTITUTION.ALERT_REGISTER_REQUIRED
                    )
                }
            }
        } catch (err) {
            console.error('error', err.message)
            return Promise.reject(err)
        }
        return this._familyRepository.update(family)
    }

    public async remove(id: string | number): Promise<boolean> {
        return this._familyRepository.delete(id)
    }

    public async getAllChildren(familyId: string, query: IQuery): Promise<Array<Child>> {
        throw new Error('Not implemented')
    }

    public async associateChild(familyId: string, childId: string): Promise<Family> {
        throw new Error('Not implemented')
    }

    public async disassociateChild(familyId: string, childId: string): Promise<boolean> {
        throw new Error('Not implemented')
    }
}
