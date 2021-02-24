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
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { IChildrenGroupRepository } from '../port/children.group.repository.interface'
import { IFamilyRepository } from '../port/family.repository.interface'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { UpdateChildValidator } from '../domain/validator/update.child.validator'
import { NfcTagValidator } from '../domain/validator/nfc.tag.validator'
import { NotFoundException } from '../domain/exception/not.found.exception'

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
        // The repository findAll() method applies specific logic because of filters with the username.
        // This is necessary because the username is saved encrypted in the database.
        // Otherwise, the find() method would suffice.
        return this._childRepository.findAll(query)
    }

    public async getById(id: string, query: IQuery): Promise<Child> {
        // 1. Validate id.
        ObjectIdValidator.validate(id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Get a child.
        return this._childRepository.findOne(query)
    }

    public async update(child: Child): Promise<Child | undefined> {
        try {
            // 1. Validate Child parameters.
            UpdateChildValidator.validate(child)

            // 2. checks if the child exists by id
            if (!(await this._childRepository.checkExist(child))) {
                return Promise.resolve(undefined)
            }

            // 3. Check if there is already an child with the same username to be updated.
            if (child.username) {
                const id: string = child.id!
                child.id = undefined
                if (await this._childRepository.checkExist(child)) {
                    throw new ConflictException(Strings.CHILD.ALREADY_REGISTERED)
                }
                child.id = id
            }

            // 4. Checks if the institution exists.
            if (child.institution && child.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(child.institution)
                if (!institutionExist) {
                    throw new ValidationException(
                        Strings.INSTITUTION.REGISTER_REQUIRED,
                        Strings.INSTITUTION.ALERT_REGISTER_REQUIRED
                    )
                }
            }

            // 5. Update child data.
            const childUp = await this._childRepository.update(child)

            // 6. If updated successfully, the object is published on the message bus.
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
            // 7. Returns the created object.
            return Promise.resolve(childUp)
        } catch (err) {
            return Promise.reject(err)
        }
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

    public getByNfcTag(tag: string): Promise<Child | undefined> {
        try {
            NfcTagValidator.validate(tag)
            return this._childRepository.getByNfcTag(tag)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async saveNfcTag(childId: string, tag: string): Promise<Child> {
        try {
            const child = new Child().fromJSON({ id: childId })
            child.nfcTag = tag
            child.tag_ass_time = new Date()

            // 1. Validate Child parameters.
            ObjectIdValidator.validate(childId)
            NfcTagValidator.validate(tag)

            // 2. checks if the child exists by id
            if (!(await this._childRepository.checkExist(child))) {
                throw new NotFoundException(Strings.CHILD.NOT_FOUND, Strings.CHILD.NOT_FOUND_DESCRIPTION)
            }

            // 3. checks if the same NFC tag is already in use.
            const childTag = await this._childRepository.getByNfcTag(tag)
            if (childTag) {
                if (childTag.id !== childId) throw new ConflictException(
                    Strings.CHILD.NFC_TAG_ALREADY_REGISTERED, Strings.CHILD.NFC_TAG_ALREADY_REGISTERED_DESC
                )

                // Child already has the tag, no need to save!!!
                if (childTag.tag_ass_time) return Promise.resolve(childTag)
            }
            return this._childRepository.update(child)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async removeNfcTag(childId: string): Promise<boolean> {
        try {
            const child = new Child().fromJSON({ id: childId })
            child.nfcTag = 'none'
            child.tag_ass_time = new Date(0)
            // 1. Validate Child parameters.
            ObjectIdValidator.validate(childId)

            // 2. checks if the child exists by id
            if (!(await this._childRepository.checkExist(child))) {
                throw new NotFoundException(Strings.CHILD.NOT_FOUND, Strings.CHILD.NOT_FOUND_DESCRIPTION)
            }

            // 4. Remove tag association
            await this._childRepository.update(child)

            // a. Returns true
            return Promise.resolve(true)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
