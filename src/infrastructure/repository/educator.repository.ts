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
                    query.filters = result._id
                    return resolve(this.findOne(query))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public find(query: IQuery): Promise<Array<Educator>> {
        query.addFilter({ type: UserType.EDUCATOR })
        const q: any = query.toJSON()
        const populate: any = { path: 'children_groups', populate: { path: 'children' } }

        return new Promise<Array<Educator>>((resolve, reject) => {
            this.educatorModel.find(q.filters)
                .sort(q.ordination)
                .skip(Number((q.pagination.limit * q.pagination.page) - q.pagination.limit))
                .limit(Number(q.pagination.limit))
                .populate(populate)
                .exec()
                .then((result: Array<Educator>) => resolve(result.map(item => this.educatorMapper.transform(item))))
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
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
}
