import { inject, injectable } from 'inversify'
import { IQuery } from '../port/query.interface'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ConflictException } from '../domain/exception/conflict.exception'
import { ValidationException } from '../domain/exception/validation.exception'
import { IFamilyService } from '../port/family.service.interface'
import { Family } from '../domain/model/family'
import { CreateFamilyValidator } from '../domain/validator/create.family.validator'
import { IFamilyRepository } from '../port/family.repository.interface'
import { Child } from '../domain/model/child'
import { IChildRepository } from '../port/child.repository.interface'
import { IInstitutionRepository } from '../port/institution.repository.interface'
import { Strings } from '../../utils/strings'
import { UserType } from '../domain/model/user'
import { UpdateUserValidator } from '../domain/validator/update.user.validator'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'

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
                @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                @inject(Identifier.LOGGER) private readonly _logger: ILogger) {
    }

    public async add(family: Family): Promise<Family> {
        try {
            // 1. Validate Family parameters.
            CreateFamilyValidator.validate(family)

            // 1.5 Ignore last_login attribute if exists.
            if (family.last_login) family.last_login = undefined

            // 2. Checks if family already exists.
            const familyExist = await this._familyRepository.checkExist(family)
            if (familyExist) throw new ConflictException(Strings.FAMILY.ALREADY_REGISTERED)

            // 3. Checks if the children to be associated have a record. Your registration is required.
            if (family.children) {
                const checkChildrenExist: boolean | ValidationException = await this._childRepository.checkExist(family.children)
                if (checkChildrenExist instanceof ValidationException) {
                    throw new ValidationException(
                        Strings.CHILD.CHILDREN_REGISTER_REQUIRED,
                        Strings.CHILD.IDS_WITHOUT_REGISTER.concat(' ').concat(checkChildrenExist.message)
                    )
                }
            }

            // 4. Checks if the institution exists.
            if (family.institution && family.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(family.institution)
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

        // 5. Create new family register.
        return this._familyRepository.create(family)
    }

    public async getAll(query: IQuery): Promise<Array<Family>> {
        return this._familyRepository.find(query)
    }

    public async getById(id: string, query: IQuery): Promise<Family> {
        // 1. Validate id.
        ObjectIdValidator.validate(id, Strings.FAMILY.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Find a family.
        query.addFilter({ _id: id, type: UserType.FAMILY })
        return this._familyRepository.findOne(query)
    }

    public async update(family: Family): Promise<Family> {
        try {
            // 1. Validate Family parameters.
            UpdateUserValidator.validate(family)

            // 2. Checks if family already exists.
            const id: string = family.id!
            family.id = undefined

            const familyExist = await this._familyRepository.checkExist(family)
            if (familyExist) throw new ConflictException(Strings.FAMILY.ALREADY_REGISTERED)

            family.id = id

            // 3. Checks if the children to be associated have a record. Your registration is required.
            if (family.children) {
                const checkChildrenExist: boolean | ValidationException = await this._childRepository.checkExist(family.children)
                if (checkChildrenExist instanceof ValidationException) {
                    throw new ValidationException(
                        Strings.CHILD.CHILDREN_REGISTER_REQUIRED,
                        Strings.CHILD.IDS_WITHOUT_REGISTER.concat(' ').concat(checkChildrenExist.message)
                    )
                }
            }

            // 4. Checks if the institution exists.
            if (family.institution && family.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(family.institution)
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

        // 5. Update family data
        const familyUp = await this._familyRepository.update(family)

        // 6. If updated successfully, the object is published on the message bus.
        if (familyUp) {
            this._eventBus.bus
                .pubUpdateFamily(familyUp)
                .then(() => {
                    this._logger.info(`User of type Family with ID: ${familyUp.id} has been updated`
                        .concat(' and published on event bus...'))
                })
                .catch((err) => {
                    this._logger.error(`Error trying to publish event UpdateFamily. ${err.message}`)
                })
        }
        // 7. Returns the created object.
        return Promise.resolve(familyUp)
    }

    public async remove(id: string): Promise<boolean> {
        // 1. Validate id.
        ObjectIdValidator.validate(id, Strings.FAMILY.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Delete a family.
        return this._familyRepository.delete(id)
    }

    public async getAllChildren(familyId: string, query: IQuery): Promise<Array<Child> | undefined> {
        // 1. Validate id.
        ObjectIdValidator.validate(familyId, Strings.FAMILY.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Get all children from family.
        query.addFilter({ _id: familyId, type: UserType.FAMILY })

        try {
            const family: Family = await this._familyRepository.findById(familyId)
            if (!family) return Promise.resolve(undefined)

            return Promise.resolve(family.children ? family.children : [])
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async associateChild(familyId: string, childId: string): Promise<Family> {

        // 1. Validate if family id or child id is valid
        ObjectIdValidator.validate(familyId, Strings.FAMILY.PARAM_ID_NOT_VALID_FORMAT)
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        const child = new Child()
        child.id = childId

        try {
            // 2. Checks if the family exists.
            const family: Family = await this._familyRepository.findById(familyId)
            if (!family) {
                throw new ValidationException(Strings.FAMILY.NOT_FOUND, Strings.FAMILY.NOT_FOUND_DESCRIPTION)
            }

            // 3. Checks if the child to be associated have a record. Your registration is required.
            const checkChildExist: boolean | ValidationException = await this._childRepository.checkExist(child)
            if (!checkChildExist) {
                throw new ValidationException(Strings.CHILD.ASSOCIATION_FAILURE)
            }

            // 4. Associates the child with the family and updates the family register.
            family.addChild(child)
            return this._familyRepository.update(family)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async disassociateChild(familyId: string, childId: string): Promise<boolean | undefined> {
        try {

            // 1. Validate if family id or child id is valid
            ObjectIdValidator.validate(familyId, Strings.FAMILY.PARAM_ID_NOT_VALID_FORMAT)
            ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

            // 2. Checks if the family exists.
            const family: Family = await this._familyRepository.findById(familyId)
            if (!family) return Promise.resolve(undefined)

            // 3. verifies that the child is no longer associated.
            if (family.children) {
                family.children = await family.children.filter(child => child.id !== childId)
                return await this._familyRepository.update(family) !== undefined
            }

            // 4. Successful operation, returns true.
            return await Promise.resolve(true)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public count(): Promise<number> {
        return this._familyRepository.count()
    }

    public countChildrenFromFamily(familyId: string): Promise<number> {
        return this._familyRepository.countChildrenFromFamily(familyId)
    }
}
