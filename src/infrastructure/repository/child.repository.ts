import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { UserType } from '../../application/domain/model/user'
import { IChildRepository } from '../../application/port/child.repository.interface'
import { Child } from '../../application/domain/model/child'
import { ChildEntity } from '../entity/child.entity'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Identifier } from '../../di/identifiers'
import { Query } from './query/query'
import { ObjectId } from 'bson'
import { ValidationException } from '../../application/domain/exception/validation.exception'
import { IUserRepository } from '../../application/port/user.repository.interface'

/**
 * Implementation of the child repository.
 *
 * @implements {IChildRepository}
 */
@injectable()
export class ChildRepository extends BaseRepository<Child, ChildEntity> implements IChildRepository {

    constructor(
        @inject(Identifier.USER_REPO_MODEL) readonly childModel: any,
        @inject(Identifier.CHILD_ENTITY_MAPPER) readonly childMapper: IEntityMapper<Child, ChildEntity>,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(childModel, childMapper, logger)
    }

    public create(item: Child): Promise<Child> {
        // Encrypt password
        if (item.password) item.password = this._userRepository.encryptPassword(item.password)
        return super.create(item)
    }

    public checkExist(children: Child | Array<Child>): Promise<boolean | ValidationException> {
        const query: Query = new Query()

        return new Promise<boolean | ValidationException>((resolve, reject) => {
            if (children instanceof Array) {
                if (children.length === 0) return resolve(false)

                let count = 0
                const resultChildrenIDs: Array<string> = []
                children.forEach((child: Child) => {
                    if (child.id) query.filters = { _id: child.id }
                    else query.filters = { username: child.username }

                    query.addFilter({ type: UserType.CHILD })
                    super.findOne(query)
                        .then(result => {
                            count++
                            if (!result && child.id) resultChildrenIDs.push(child.id)
                            if (count === children.length) {
                                if (resultChildrenIDs.length > 0) {
                                    return resolve(new ValidationException(resultChildrenIDs.join(', ')))
                                }
                                return resolve(true)
                            }
                        })
                        .catch(err => reject(super.mongoDBErrorListener(err)))
                })
            } else {
                if (children.id) query.filters = { _id: new ObjectId(children.id) }
                else query.filters = { username: children.username }

                query.addFilter({ type: UserType.CHILD })
                super.findOne(query)
                    .then((result: Child) => {
                        if (result) return resolve(true)
                        return resolve(false)
                    })
                    .catch(err => reject(super.mongoDBErrorListener(err)))
            }
        })
    }
}
