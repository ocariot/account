import { inject, injectable } from 'inversify'
import { IChildService } from '../port/child.service.interface'
import { Child } from '../domain/model/child'
import { IQuery } from '../port/query.interface'
import { Identifier } from '../../di/identifiers'
import { IChildRepository } from '../port/child.repository.interface'
import { ILogger } from '../../utils/custom.logger'
import { CreateChildValidator } from '../domain/validator/create.child.validator'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IInstitutionRepository } from '../port/institution.repository.interface'
import { ValidationException } from '../domain/exception/validation.exception'
import { Strings } from '../../utils/strings'
import { UserType } from '../domain/model/user'
import { UpdateUserValidator } from '../domain/validator/update.user.validator'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { IChildrenGroupRepository } from '../port/children.group.repository.interface'
import { IFamilyRepository } from '../port/family.repository.interface'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'

/**
 * Implementing child Service.
 *
 * @implements {IChildService}
 */
@injectable()
export class ChildService implements IChildService {

    constructor(@inject(Identifier.CHILD_REPOSITORY) private readonly _childRepository: IChildRepository,
                @inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
                @inject(Identifier.CHILDREN_GROUP_REPOSITORY) private readonly _childrenGroupRepository: IChildrenGroupRepository,
                @inject(Identifier.FAMILY_REPOSITORY) private readonly _familyRepository: IFamilyRepository,
                @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                @inject(Identifier.LOGGER) private readonly _logger: ILogger) {
    }

    public async add(child: Child): Promise<Child> {
        try {
            // 1. Validate Child parameters.
            CreateChildValidator.validate(child)

            // 1.5 Ignore last_login and last_sync attributes if exists.
            if (child.last_login) child.last_login = undefined
            if (child.last_sync) child.last_sync = undefined

            // 2. Checks if child already exists.
            const childExist = await this._childRepository.checkExist(child)
            if (childExist) throw new ConflictException(Strings.CHILD.ALREADY_REGISTERED)

            // 3. Checks if the institution exists.
            if (child.institution && child.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(child.institution)
                if (!institutionExist) {
                    throw new ValidationException(
                        Strings.INSTITUTION.REGISTER_REQUIRED,
                        Strings.INSTITUTION.ALERT_REGISTER_REQUIRED
                    )
                }
            }

            // 4. Create new child register.
            const childSaved: Child = await this._childRepository.create(child)

            // 5. If created successfully, the object is published on the message bus.
            if (childSaved) {
                this._eventBus.bus
                    .pubSaveChild(childSaved)
                    .then(() => {
                        this._logger.info(`User of type Child with ID: ${childSaved.id} published on event bus...`)
                    })
                    .catch((err) => {
                        this._logger.error(`Error trying to publish event SaveChild. ${err.message}`)
                    })
            }
            // 5. Returns the created object.
            return Promise.resolve(childSaved)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async getAll(query: IQuery): Promise<Array<Child>> {
        return this._childRepository.find(query)
    }

    public async getById(id: string, query: IQuery): Promise<Child> {
        // 1. Validate id.
        ObjectIdValidator.validate(id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Get a child.
        query.addFilter({ _id: id, type: UserType.CHILD })
        return this._childRepository.findOne(query)
    }

    public async update(child: Child): Promise<Child> {
        try {
            // 1. Validate Child parameters.
            UpdateUserValidator.validate(child)

            // 1.5 Ignore last_login and last_sync attributes if exists.
            if (child.last_login) child.last_login = undefined
            if (child.last_sync) child.last_sync = undefined

            // 2. Checks if child already exists.
            const id: string = child.id!
            child.id = undefined

            const childExist = await this._childRepository.checkExist(child)
            if (childExist) throw new ConflictException(Strings.CHILD.ALREADY_REGISTERED)

            child.id = id

            // 3. Checks if the institution exists.
            if (child.institution && child.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(child.institution)
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

        // 4. Update child data.
        const childUp = await this._childRepository.update(child)

        // 5. If updated successfully, the object is published on the message bus.
        if (childUp) {
            this._eventBus.bus
                .pubUpdateChild(childUp)
                .then(() => {
                    this._logger.info(`User of type Child with ID: ${childUp.id} has been updated`
                        .concat(' and published on event bus...'))
                })
                .catch((err) => {
                    this._logger.error(`Error trying to publish event UpdateChild. ${err.message}`)
                })
        }
        // 6. Returns the created object.
        return Promise.resolve(childUp)
    }

    public async remove(id: string): Promise<boolean> {
        // 1. Validate id.
        ObjectIdValidator.validate(id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Delete a child
        const childDel = await this._childRepository.delete(id)
        if (!childDel) return Promise.resolve(false)

        // 3. Disassociate a child from another entities if the delete was successful
        try {
            await this._childrenGroupRepository.disassociateChildFromChildrenGroups(id)
            await this._familyRepository.disassociateChildFromFamily(id)
        } catch (err) {
            // _logger warn
            this._logger.warn(`A error occur when try disassociate the child! ${err}`)
        }
        return Promise.resolve(true)
    }

    public count(): Promise<number> {
        return this._childRepository.count()
    }
}
