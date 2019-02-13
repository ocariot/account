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
import { CreateEducatorValidator } from '../domain/validator/create.educator.validator'
import { ChildrenGroup } from '../domain/model/children.group'
import { IChildrenGroupService } from '../port/children.group.service.interface'
import { UpdateUserValidator } from '../domain/validator/update.user.validator'
import { IChildrenGroupRepository } from '../port/children.group.repository.interface'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { UserUpdateEvent } from '../integration-event/event/user.update.event'

/**
 * Implementing educator Service.
 *
 * @implements {IEducatorService}
 */
@injectable()
export class EducatorService implements IEducatorService {

    constructor(@inject(Identifier.EDUCATOR_REPOSITORY) private readonly _educatorRepository: IEducatorRepository,
                @inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
                @inject(Identifier.CHILDREN_GROUP_REPOSITORY) private readonly _childrenGroupRepository: IChildrenGroupRepository,
                @inject(Identifier.CHILDREN_GROUP_SERVICE) private readonly _childrenGroupService: IChildrenGroupService,
                @inject(Identifier.LOGGER) readonly logger: ILogger,
                @inject(Identifier.RABBITMQ_EVENT_BUS) readonly _eventBus: IEventBus) {
    }

    public async add(educator: Educator): Promise<Educator> {
        CreateEducatorValidator.validate(educator)

        try {
            // 1. Checks if Educator already exists.
            const educatorExist = await this._educatorRepository.checkExist(educator)
            if (educatorExist) throw new ConflictException(Strings.EDUCATOR.ALREADY_REGISTERED)

            // 2. Checks if the institution exists.
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

        // 3. Create new Educator register.
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
        UpdateUserValidator.validate(educator)

        try {
            // 1. Checks if the institution exists.
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

        // 2. Update Educator data.
        const educatorUp = await this._educatorRepository.update(educator)

        // 3. Publish updated educator data.
        if (educatorUp) {
            const event = new UserUpdateEvent<Educator>('EducatorUpdateEvent', new Date(), educatorUp)
            console.log(event.toJSON())
            this._eventBus.publish(event, 'educators.update')
        }

        return educatorUp
    }

    public async remove(id: string): Promise<boolean> {
        let isDeleted: boolean

        // 1. Delete the educator by id and your children groups.
        try {
            isDeleted = await this._educatorRepository.delete(id)
            if (isDeleted) await this._childrenGroupRepository.deleteAllChildrenGroupsFomUser(id)
        } catch (err) {
            return Promise.reject(err)
        }

        // 2. Returns status for educator deletion.
        return Promise.resolve(isDeleted)
    }

    public async saveChildrenGroup(educatorId: string, childrenGroup: ChildrenGroup): Promise<ChildrenGroup> {
        try {
            // 1. Checks if the educator exists.
            const educator: Educator = await this._educatorRepository.findById(educatorId)
            if (!educator || !educator.children_groups) {
                throw new ValidationException(
                    Strings.EDUCATOR.NOT_FOUND,
                    Strings.EDUCATOR.NOT_FOUND_DESCRIPTION
                )
            }

            // 2. Save children group.
            const childrenGroupResult: ChildrenGroup = await this._childrenGroupService.add(childrenGroup)

            // 3. Update educator with group of children created.
            educator.addChildrenGroup(childrenGroupResult)
            await this._educatorRepository.update(educator)

            // 4. If everything succeeds, it returns the data of the created group.
            return Promise.resolve(childrenGroupResult)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async getAllChildrenGroups(educatorId: string, query: IQuery): Promise<Array<ChildrenGroup>> {
        try {
            // 1. Checks if the educator exists.
            const educator: Educator = await this._educatorRepository.findById(educatorId)
            if (!educator || educator.id !== educatorId
                || (educator.children_groups && educator.children_groups.length === 0)) {
                return Promise.resolve([])
            }

            // 2. Retrieves children groups by educator id.
            query.addFilter({ user_id: educatorId })
            return this._childrenGroupService.getAll(query)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async getChildrenGroupById(educatorId: string, childrenGroupId: string, query: IQuery):
        Promise<ChildrenGroup | undefined> {

        try {
            // 1. Checks if the educator exists.
            const educator: Educator = await this._educatorRepository.findById(educatorId)
            if (!educator || !educator.children_groups) return Promise.resolve(undefined)

            // 2. Verifies that the group of children belongs to the educator.
            const checkGroups: Array<ChildrenGroup> = await educator.children_groups.filter((obj, pos, arr) => {
                return arr.map(childrenGroup => childrenGroup.id).indexOf(childrenGroupId) === pos
            })

            // 3. The group to be selected does not exist or is not assigned to the educator.
            //    When the group is assigned the checkGroups array size will be equal to 1.
            if (checkGroups.length !== 1) return Promise.resolve(undefined)
        } catch (err) {
            return Promise.reject(err)
        }

        // 4. The group to be selected exists and is related to the educator.
        // Then, it can be selected.
        return this._childrenGroupService.getById(childrenGroupId, query)
    }

    public async updateChildrenGroup(educatorId: string, childrenGroup: ChildrenGroup): Promise<ChildrenGroup> {
        try {
            // 1. Checks if the educator exists.
            const educator: Educator = await this._educatorRepository.findById(educatorId)
            if (!educator) {
                throw new ValidationException(
                    Strings.EDUCATOR.NOT_FOUND,
                    Strings.EDUCATOR.NOT_FOUND_DESCRIPTION
                )
            }

            // 2. Update children group.
            const childrenGroupResult: ChildrenGroup = await this._childrenGroupService.update(childrenGroup)

            // 3. If everything succeeds, it returns the data of the created group.
            return Promise.resolve(childrenGroupResult)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async deleteChildrenGroup(educatorId: string, childrenGroupId: string): Promise<boolean> {
        try {
            // 1. Checks if the educator exists.
            const educator: Educator = await this._educatorRepository.findById(educatorId)
            if (!educator) {
                throw new ValidationException(
                    Strings.EDUCATOR.NOT_FOUND,
                    Strings.EDUCATOR.NOT_FOUND_DESCRIPTION
                )
            }

            // 2. Remove the children group
            const removeResult: boolean = await this._childrenGroupService.remove(childrenGroupId)

            // 3. Remove association with educator
            if (removeResult) {
                const childrenGroup: ChildrenGroup = new ChildrenGroup()
                childrenGroup.id = childrenGroupId
                await educator.removeChildrenGroup(childrenGroup)

                // 4. Update educator.
                await this._educatorRepository.update(educator)
            }

            // 5. Returns true if the operation was successful, otherwise false.
            return Promise.resolve(removeResult)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
