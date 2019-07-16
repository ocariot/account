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

    public create(item: ChildrenGroup): Promise<ChildrenGroup> {
        const itemNew: ChildrenGroup = this.mapper.transform(item)
        return new Promise<ChildrenGroup>((resolve, reject) => {
            this.Model.create(itemNew)
                .then((result) => {
                    // Required due to 'populate ()' routine.
                    // If there is no need for 'populate ()', the return will suffice.
                    const query = new Query()
                    query.filters = result._id
                    return resolve(this.findOne(query))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public find(query: IQuery): Promise<Array<ChildrenGroup>> {
        const q: any = query.toJSON()
        const populate: any = { path: 'children', select: {}, populate: { path: 'institution' } }

        for (const key in q.fields) {
            if (key.startsWith('institution.')) {
                populate.select[key.split('.')[1]] = 1
                delete q.fields[key]
            }
        }

        return new Promise<Array<ChildrenGroup>>((resolve, reject) => {
            this.Model.find(q.filters)
                .sort(q.ordination)
                .skip(Number((q.pagination.limit * q.pagination.page) - q.pagination.limit))
                .limit(Number(q.pagination.limit))
                .populate(populate)
                .exec() // execute query
                .then((result: Array<ChildrenGroup>) => resolve(result.map(item => this.mapper.transform(item))))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public findOne(query: IQuery): Promise<ChildrenGroup> {
        const q: any = query.toJSON()
        const populate: any = { path: 'children', select: {}, populate: { path: 'institution' } }

        for (const key in q.fields) {
            if (key.startsWith('institution.')) {
                populate.select[key.split('.')[1]] = 1
                delete q.fields[key]
            }
        }

        return new Promise<ChildrenGroup>((resolve, reject) => {
            this.Model.findOne(q.filters)
                .populate(populate)
                .exec()
                .then((result: ChildrenGroup) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.mapper.transform(result))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public update(item: ChildrenGroup): Promise<ChildrenGroup> {
        const itemUp: any = this.mapper.transform(item)
        const populate: any = { path: 'children', populate: { path: 'institution' } }

        return new Promise<ChildrenGroup>((resolve, reject) => {
            this.Model.findOneAndUpdate({ _id: itemUp.id }, itemUp, { new: true })
                .populate(populate)
                .exec()
                .then((result: ChildrenGroup) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.mapper.transform(result))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public checkExist(childrenGroup: ChildrenGroup): Promise<boolean> {
        const query: Query = new Query()
        if (childrenGroup.id) query.filters = { _id: childrenGroup.id }
        else return Promise.resolve(false)

        return new Promise<boolean>((resolve, reject) => {
            super.findOne(query)
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
