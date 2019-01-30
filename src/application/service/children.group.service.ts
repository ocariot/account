import { inject, injectable } from 'inversify'
import { IQuery } from '../port/query.interface'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ConflictException } from '../domain/exception/conflict.exception'
import { ValidationException } from '../domain/exception/validation.exception'
import { IChildRepository } from '../port/child.repository.interface'
import { Strings } from '../../utils/strings'
import { IChildrenGroupRepository } from '../port/children.group.repository.interface'
import { IChildrenGroupService } from '../port/children.group.service.interface'
import { ChildrenGroup } from '../domain/model/children.group'
import { ChildrenGroupValidator } from '../domain/validator/children.group.validator'

/**
 * Implementing Children Group Service.
 *
 * @implements {IChildrenGroupService}
 */
@injectable()
export class ChildrenGroupService implements IChildrenGroupService {

    constructor(@inject(Identifier.CHILDREN_GROUP_REPOSITORY) private readonly _childrenGroupRepository: IChildrenGroupRepository,
                @inject(Identifier.CHILD_REPOSITORY) private readonly _childRepository: IChildRepository,
                @inject(Identifier.LOGGER) readonly logger: ILogger) {
    }

    public async add(childrenGroup: ChildrenGroup): Promise<ChildrenGroup> {
        ChildrenGroupValidator.validate(childrenGroup)

        try {
            // Checks if childrenGroup already exists
            const childrenGroupExist = await this._childrenGroupRepository.checkExist(childrenGroup)
            if (childrenGroupExist) throw new ConflictException(Strings.CHILDREN_GROUP.ALREADY_REGISTERED)

            // Checks if the children to be associated have a record. Your registration is required.
            if (childrenGroup.children) {
                const checkChildrenExist: boolean | ValidationException = await this._childRepository
                    .checkExist(childrenGroup.children)
                if (checkChildrenExist instanceof ValidationException) {
                    throw new ValidationException(
                        Strings.CHILD.CHILDREN_REGISTER_REQUIRED,
                        Strings.CHILD.IDS_WITHOUT_REGISTER.concat(' ').concat(checkChildrenExist.message)
                    )
                }
            }
        } catch (err) {
            return Promise.reject(err)
        }

        return this._childrenGroupRepository.create(childrenGroup)
    }

    public async getAll(query: IQuery): Promise<Array<ChildrenGroup>> {
        return this._childrenGroupRepository.find(query)
    }

    public async getById(id: string | number, query: IQuery): Promise<ChildrenGroup> {
        query.filters = ({ _id: id })
        return this._childrenGroupRepository.findOne(query)
    }

    public async update(childrenGroup: ChildrenGroup): Promise<ChildrenGroup> {
        try {
            // Checks if the children to be associated have a record. Your registration is required.
            if (childrenGroup.children) {
                const checkChildrenExist: boolean | ValidationException = await this._childRepository
                    .checkExist(childrenGroup.children)
                if (checkChildrenExist instanceof ValidationException) {
                    throw new ValidationException(
                        Strings.CHILD.CHILDREN_REGISTER_REQUIRED,
                        Strings.CHILD.IDS_WITHOUT_REGISTER.concat(' ').concat(checkChildrenExist.message)
                    )
                }
            }
        } catch (err) {
            return Promise.reject(err)
        }
        return this._childrenGroupRepository.update(childrenGroup)
    }

    public async remove(id: string | number): Promise<boolean> {
        return this._childrenGroupRepository.delete(id)
    }
}
