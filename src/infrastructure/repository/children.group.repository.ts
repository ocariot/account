import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Identifier } from '../../di/identifiers'
import { Query } from './query/query'
import { ChildrenGroup } from '../../application/domain/model/children.group'
import { ChildrenGroupEntity } from '../entity/children.group.entity'
import { IChildrenGroupRepository } from '../../application/port/children.group.repository.interface'
import { IQuery } from '../../application/port/query.interface'

/**
 * Implementation of the Children Group repository.
 *
 * @implements {IChildrenGroupRepository}
 */
@injectable()
export class ChildrenGroupRepository extends BaseRepository<ChildrenGroup, ChildrenGroupEntity>
    implements IChildrenGroupRepository {

    constructor(
        @inject(Identifier.CHILDREN_GROUP_REPO_MODEL) readonly childrenGroupModel: any,
        @inject(Identifier.CHILDREN_GROUP_ENTITY_MAPPER) readonly childrenGroupMapper:
            IEntityMapper<ChildrenGroup, ChildrenGroupEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(childrenGroupModel, childrenGroupMapper, logger)
    }

    public find(query: IQuery): Promise<Array<ChildrenGroup>> {
        const q: any = query.toJSON()
        const populate: any = { path: 'children', select: {} }

        return new Promise<Array<ChildrenGroup>>((resolve, reject) => {
            this.childrenGroupModel.find(q.filters)
                .collation({ locale: 'en', caseLevel: true, numericOrdering: true, strength: 2 })
                .sort(q.ordination)
                .skip(Number((q.pagination.limit * q.pagination.page) - q.pagination.limit))
                .limit(Number(q.pagination.limit))
                .populate(populate)
                .exec() // execute query
                .then((result: Array<ChildrenGroup>) => resolve(result.map(item => this.childrenGroupMapper.transform(item))))
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public findOne(query: IQuery): Promise<ChildrenGroup> {
        const q: any = query.toJSON()
        const populate: any = { path: 'children', select: {} }

        return new Promise<ChildrenGroup>((resolve, reject) => {
            this.childrenGroupModel.findOne(q.filters)
                .populate(populate)
                .exec()
                .then((result: ChildrenGroup) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.childrenGroupMapper.transform(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public update(item: ChildrenGroup): Promise<ChildrenGroup> {
        const itemUp: any = this.childrenGroupMapper.transform(item)
        const populate: any = { path: 'children' }

        return new Promise<ChildrenGroup>((resolve, reject) => {
            this.childrenGroupModel.findOneAndUpdate({ _id: itemUp.id }, itemUp, { new: true })
                .populate(populate)
                .exec()
                .then((result: ChildrenGroup) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.childrenGroupMapper.transform(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public checkExist(childrenGroup: ChildrenGroup): Promise<boolean> {
        const query: Query = new Query()
        if (childrenGroup.id) query.filters = { _id: childrenGroup.id }
        else query.filters = { name: childrenGroup.name, user_id: childrenGroup.user!.id }

        return new Promise<boolean>((resolve, reject) => {
            this.findOne(query)
                .then((result: ChildrenGroup) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public deleteAllChildrenGroupsFromUser(userId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.childrenGroupModel.deleteMany({ user_id: userId }, (err) => {
                if (err) return reject(super.mongoDBErrorListener(err))
                return resolve(true)
            })
        })
    }

    public disassociateChildFromChildrenGroups(childId: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.childrenGroupModel.updateMany({ children: { $in: childId } },
                { $pullAll: { children: [childId] } },
                { multi: true }, (err) => {
                    if (err) return reject(super.mongoDBErrorListener(err))
                    return resolve(true)
                })
        })
    }
}
