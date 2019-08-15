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
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'

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
                @inject(Identifier.INTEGRATION_EVENT_REPOSITORY)
                private readonly _integrationEventRepository: IIntegrationEventRepository,
                @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                @inject(Identifier.LOGGER) private readonly _logger: ILogger) {
    }

    public async add(educator: Educator): Promise<Educator> {
        try {
            // 1. Validate Educator parameters.
            CreateEducatorValidator.validate(educator)

            // 1.5 Ignore last_login attribute if exists.
            if (educator.last_login) educator.last_login = undefined

            // 2. Checks if Educator already exists.
            const educatorExist = await this._educatorRepository.checkExist(educator)
            if (educatorExist) throw new ConflictException(Strings.EDUCATOR.ALREADY_REGISTERED)

            // 3. Checks if the institution exists.
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
        // 4. Create new Educator register.
        return this._educatorRepository.create(educator)
    }

    public async getAll(query: IQuery): Promise<Array<Educator>> {
        query.addFilter({ type: UserType.EDUCATOR })
        return this._educatorRepository.find(query)
    }

    public async getById(id: string, query: IQuery): Promise<Educator> {
        // 1. Validate id.
        ObjectIdValidator.validate(id)

        // 2. Get a educator.
        query.addFilter({ _id: id, type: UserType.EDUCATOR })
        return this._educatorRepository.findOne(query)
    }

    public async update(educator: Educator): Promise<Educator> {
        try {
            // 1. Validate Educator parameters.
            UpdateUserValidator.validate(educator)

            // 2. Checks if Educator already exists.
            const id: string = educator.id!
            educator.id = undefined

            const educatorExist = await this._educatorRepository.checkExist(educator)
            if (educatorExist) throw new ConflictException(Strings.EDUCATOR.ALREADY_REGISTERED)

            educator.id = id

            // 3. Checks if the institution exists.
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

        // 4. Update Educator data.
        const educatorUp = await this._educatorRepository.update(educator)

        // 5. If updated successfully, the object is published on the message bus.
        if (educatorUp) {
            const event = new UserUpdateEvent<Educator>(
                'EducatorUpdateEvent', new Date(), educatorUp)

            if (!(await this._eventBus.publish(event, 'educators.update'))) {
                // 5. Save Event for submission attempt later when there is connection to message channel.
                this.saveEvent(event)
            } else {
                this._logger.info(`User of type Educator with ID: ${educatorUp.id} has been updated`
                    .concat(' and published on event bus...'))
            }
        }
        // 6. Returns the created object.
        return Promise.resolve(educatorUp)
    }

    public async remove(id: string): Promise<boolean> {
        let isDeleted: boolean
        try {
            // 1. Validate id.
            ObjectIdValidator.validate(id)

            // 2.Delete the educator by id and your children groups.
            isDeleted = await this._educatorRepository.delete(id)
            if (isDeleted) await this._childrenGroupRepository.deleteAllChildrenGroupsFromUser(id)
        } catch (err) {
            return Promise.reject(err)
        }

        // 3. Returns status for educator deletion.
        return Promise.resolve(isDeleted)
    }

    public async saveChildrenGroup(educatorId: string, childrenGroup: ChildrenGroup): Promise<ChildrenGroup> {
        try {
            // 1. Validate id.
            ObjectIdValidator.validate(educatorId)

            // 2. Checks if the educator exists.
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
            // 1. Validate id.
            ObjectIdValidator.validate(educatorId)

            // 2. Checks if the educator exists.
            const educator: Educator = await this._educatorRepository.findById(educatorId)
            if (!educator || educator.id !== educatorId
                || (educator.children_groups && educator.children_groups.length === 0)) {
                return Promise.resolve([])
            }

            // 3. Retrieves children groups by educator id.
            query.addFilter({ user_id: educatorId })
            return this._childrenGroupService.getAll(query)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async getChildrenGroupById(educatorId: string, childrenGroupId: string, query: IQuery):
        Promise<ChildrenGroup | undefined> {
        try {
            // 1. Validate if educator id or children group id is valid
            ObjectIdValidator.validate(educatorId)
            ObjectIdValidator.validate(childrenGroupId)

            // 2. Checks if the educator exists.
            const educator: Educator = await this._educatorRepository.findById(educatorId)
            if (!educator || !educator.children_groups) return Promise.resolve(undefined)

            // 3. Verifies that the group of children belongs to the educator.
            const checkGroups: Array<ChildrenGroup> = await educator.children_groups.filter((obj, pos, arr) => {
                return arr.map(childrenGroup => childrenGroup.id).indexOf(childrenGroupId) === pos
            })

            // 4. The group to be selected does not exist or is not assigned to the educator.
            //    When the group is assigned the checkGroups array size will be equal to 1.
            if (checkGroups.length !== 1) return Promise.resolve(undefined)
        } catch (err) {
            return Promise.reject(err)
        }

        // 5. The group to be selected exists and is related to the educator.
        // Then, it can be selected.
        return this._childrenGroupService.getById(childrenGroupId, query)
    }

    public async updateChildrenGroup(educatorId: string, childrenGroup: ChildrenGroup): Promise<ChildrenGroup> {
        try {
            // 1. Validate if educator id or children group id is valid
            ObjectIdValidator.validate(educatorId)
            if (childrenGroup.id) ObjectIdValidator.validate(childrenGroup.id)

            // 2. Checks if the educator exists.
            const educator: Educator = await this._educatorRepository.findById(educatorId)
            if (!educator) {
                throw new ValidationException(
                    Strings.EDUCATOR.NOT_FOUND,
                    Strings.EDUCATOR.NOT_FOUND_DESCRIPTION
                )
            }

            // 3. Update children group.
            const childrenGroupResult: ChildrenGroup = await this._childrenGroupService.update(childrenGroup)

            // 4. If everything succeeds, it returns the data of the created group.
            return Promise.resolve(childrenGroupResult)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async deleteChildrenGroup(educatorId: string, childrenGroupId: string): Promise<boolean> {
        try {
            // 1. Validate if educator id or children group id is valid
            ObjectIdValidator.validate(educatorId)
            ObjectIdValidator.validate(childrenGroupId)

            // 2. Checks if the educator exists.
            const educator: Educator = await this._educatorRepository.findById(educatorId)
            if (!educator) {
                return Promise.resolve(true)
            }

            // 3. Remove the children group
            const removeResult: boolean = await this._childrenGroupService.remove(childrenGroupId)

            // 4. Remove association with educator
            if (removeResult) {
                const childrenGroup: ChildrenGroup = new ChildrenGroup()
                childrenGroup.id = childrenGroupId
                await educator.removeChildrenGroup(childrenGroup)

                // 5. Update educator.
                await this._educatorRepository.update(educator)
            }

            // 6. Returns true if the operation was successful, otherwise false.
            return Promise.resolve(removeResult)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Saves the event to the database.
     * Useful when it is not possible to run the event and want to perform the
     * operation at another time.
     * @param event
     */
    private saveEvent(event: UserUpdateEvent<Educator>): void {
        const saveEvent: any = event.toJSON()
        saveEvent.__operation = 'publish'
        saveEvent.__routing_key = 'educator.update'
        this._integrationEventRepository
            .create(JSON.parse(JSON.stringify(saveEvent)))
            .then(() => {
                this._logger.warn(`Could not publish the event named ${event.event_name}.`
                    .concat(` The event was saved in the database for a possible recovery.`))
            })
            .catch(err => {
                this._logger.error(`There was an error trying to save the name event: ${event.event_name}.`
                    .concat(`Error: ${err.message}. Event: ${JSON.stringify(saveEvent)}`))
            })
    }
}
