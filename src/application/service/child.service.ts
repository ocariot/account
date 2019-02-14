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
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { UserUpdateEvent } from '../integration-event/event/user.update.event'
import { IChildrenGroupRepository } from '../port/children.group.repository.interface'
import { IFamilyRepository } from '../port/family.repository.interface'

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
                @inject(Identifier.LOGGER) readonly logger: ILogger,
                @inject(Identifier.RABBITMQ_EVENT_BUS) readonly _eventBus: IEventBus) {
    }

    public async add(child: Child): Promise<Child> {
        CreateChildValidator.validate(child)

        try {
            // 1. Checks if child already exists.
            const childExist = await this._childRepository.checkExist(child)
            if (childExist) throw new ConflictException(Strings.CHILD.ALREADY_REGISTERED)

            // 2. Checks if the institution exists.
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

        // 3. Create new child register.
        return this._childRepository.create(child)
    }

    public async getAll(query: IQuery): Promise<Array<Child>> {
        query.addFilter({ type: UserType.CHILD })
        return this._childRepository.find(query)
    }

    public async getById(id: string | number, query: IQuery): Promise<Child> {
        query.addFilter({ _id: id, type: UserType.CHILD })
        return this._childRepository.findOne(query)
    }

    public async update(child: Child): Promise<Child> {
        UpdateUserValidator.validate(child)

        try {
            // 1. Checks if the institution exists.
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

        // 2. Update child data.
        const childUp = await this._childRepository.update(child)

        // 3. Publish updated child data.
        if (childUp) {
            const event = new UserUpdateEvent<Child>('ChildUpdateEvent', new Date(), childUp)
            this._eventBus.publish(event, 'children.update')
        }

        return childUp
    }

    public async remove(id: string): Promise<boolean> {
        // 1. Delete a child
        const childDel = await this._childRepository.delete(id)
        if (!childDel) return Promise.resolve(false)

        // 2. Disassociate a child from another entities if the delete was successful
        try {
            console.log('i will return the delete now')
            await this._childrenGroupRepository.disassociateChildFromChildrenGroups(id)
            await this._familyRepository.disassociateChildFromFamily(id)
        } catch (err) {
            // logger warn
            this.logger.warn(`A error occur when try disassociate the child! ${err}`)
        }
        return Promise.resolve(true)
    }
}
