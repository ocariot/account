import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { UserType } from '../../application/domain/model/user'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Identifier } from '../../di/identifiers'
import { Query } from './query/query'
import { Educator } from '../../application/domain/model/educator'
import { EducatorEntity } from '../entity/educator.entity'
import { IEducatorRepository } from '../../application/port/educator.repository.interface'
import { IUserRepository } from '../../application/port/user.repository.interface'
import { IQuery } from '../../application/port/query.interface'

/**
 * Implementation of the educator repository.
 *
 * @implements {IEducatorRepository}
 */
@injectable()
export class EducatorRepository extends BaseRepository<Educator, EducatorEntity> implements IEducatorRepository {

    constructor(
        @inject(Identifier.USER_REPO_MODEL) readonly educatorModel: any,
        @inject(Identifier.EDUCATOR_ENTITY_MAPPER) readonly educatorMapper: IEntityMapper<Educator, EducatorEntity>,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(educatorModel, educatorMapper, logger)
    }

    public create(item: Educator): Promise<Educator> {
        // Encrypt password
        if (item.password) item.password = this._userRepository.encryptPassword(item.password)
        const itemNew: Educator = this.educatorMapper.transform(item)
        return new Promise<Educator>((resolve, reject) => {
            this.educatorModel.create(itemNew)
                .then((result) => {
                    // Required due to 'populate ()' routine.
                    // If there is no need for 'populate ()', the return will suffice.
                    const query = new Query()
                    query.filters = { _id: result._id }
                    return resolve(this.findOne(query))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public findAll(query: IQuery): Promise<Array<Educator>> {
        query.addFilter({ type: UserType.EDUCATOR })
        return super.findAll(query)
    }

    public findOne(query: IQuery): Promise<Educator> {
        const q: any = query.toJSON()
        const populate: any = { path: 'children_groups', populate: { path: 'children' } }

        return new Promise<Educator>((resolve, reject) => {
            this.educatorModel.findOne(q.filters)
                .populate(populate)
                .exec()
                .then((result: Educator) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.educatorMapper.transform(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public update(item: Educator): Promise<Educator> {
        const itemUp: any = this.educatorMapper.transform(item)
        const populate: any = { path: 'children_groups', populate: { path: 'children' } }

        return new Promise<Educator>((resolve, reject) => {
            this.educatorModel.findOneAndUpdate({ _id: itemUp.id }, itemUp, { new: true })
                .populate(populate)
                .exec()
                .then((result: Educator) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.educatorMapper.transform(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public findById(educatorId: string): Promise<Educator> {
        const query: Query = new Query()
        query.filters = { _id: educatorId, type: UserType.EDUCATOR }
        return this.findOne(query)
    }

    public checkExist(educator: Educator): Promise<boolean> {
        const query: Query = new Query()
        if (educator.id) query.filters = { _id: educator.id }

        query.addFilter({ type: UserType.EDUCATOR })
        return new Promise<boolean>((resolve, reject) => {
            this.educatorModel.find(query.filters)
                .exec()
                .then((result: Array<Educator>) => {
                    if (educator.id) {
                        if (result.length > 0) return resolve(true)
                        return resolve(false)
                    }
                    return resolve(result.some(value => value.username === educator.username))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public count(): Promise<number> {
        return super.count(new Query().fromJSON({ filters: { type: UserType.EDUCATOR } }))
    }

    public countChildrenGroups(educatorId: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.findOne(new Query().fromJSON({ filters: { _id: educatorId, type: UserType.EDUCATOR } }))
                .then(result => resolve(result && result.children_groups ? result.children_groups.length : 0))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    /**
     * Retrieves the educators who have an association with a Child according to child ID.
     *
     * @param childId
     * @return {Promise<Array<Educator>>}
     * @throws {ValidationException | RepositoryException}
     */
    public findEducatorsByChildId(childId: string): Promise<Array<Educator>> {
        const populate: any = { path: 'children_groups', populate: { path: 'children' } }

        return new Promise<Array<Educator>>((resolve, reject) => {
            this.educatorModel.find({ type: UserType.EDUCATOR })    // 1. Search all educators and populate their groups
                .populate(populate)
                .exec()
                .then((result: Array<Educator>) => {
                    // 2. Filters educators by removing those who have no association with the childId received
                    result = result.filter(educatorItem => {
                        if (educatorItem.children_groups && educatorItem.children_groups.length) {
                            // 2.1. Filter ChildrenGroups
                            educatorItem.children_groups = educatorItem.children_groups.filter(groupItem => {
                                if (groupItem.children && groupItem.children.length) {
                                    // 2.2 Filter each children array of each ChildrenGroup
                                    groupItem.children = groupItem.children.filter(childItem => childItem.id === childId)
                                }

                                return !!(groupItem.children && groupItem.children.length)
                            })
                        }

                        return !!(educatorItem.children_groups && educatorItem.children_groups.length)
                    })

                    // 3. Apply the mapper to each educator and return the array
                    resolve(result.map(item => this.educatorMapper.transform(item)))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }
}
