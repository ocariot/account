import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Identifier } from '../../di/identifiers'
import { Query } from './query/query'
import { ChildrenGroup } from '../../application/domain/model/children.group'
import { ChildrenGroupEntity } from '../entity/children.group.entity'
import { IChildrenGroupRepository } from '../../application/port/children.group.repository.interface'

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
}
