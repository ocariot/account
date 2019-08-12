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
import { IQuery } from '../../application/port/query.interface'

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
        // Encrypt username
        if (item.username) item.username = this._userRepository.encryptUsername(item.username)
        // Encrypt password
        if (item.password) item.password = this._userRepository.encryptPassword(item.password)
        const itemNew: Child = this.mapper.transform(item)
        return new Promise<Child>((resolve, reject) => {
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

    public find(query: IQuery): Promise<Array<Child>> {
        const q: any = query.toJSON()
        const populate: any = { path: 'institution', select: {}, match: {} }

        for (const key in q.filters) {
            if (key.startsWith('institution.')) {
                populate.match[key.split('.')[1]] = q.filters[key]
                delete q.filters[key]
            }
        }

        for (const key in q.fields) {
            if (key.startsWith('institution.')) {
                populate.select[key.split('.')[1]] = 1
                delete q.fields[key]
            }
        }

        return new Promise<Array<Child>>((resolve, reject) => {
            this.Model.find(q.filters)
                .sort(q.ordination)
                .skip(Number((q.pagination.limit * q.pagination.page) - q.pagination.limit))
                .limit(Number(q.pagination.limit))
                .populate(populate)
                .exec()
                .then((result: Array<Child>) => {
                    result.map(item => {
                        if (item.username) item.username = this._userRepository.decryptUsername(item.username)
                    })

                    return resolve(
                        result
                        .filter(item => item.institution)
                        .map(item => this.mapper.transform(item))
                    )
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public findOne(query: IQuery): Promise<Child> {
        const q: any = query.toJSON()
        const populate: any = { path: 'institution', select: {} }

        for (const key in q.fields) {
            if (key.startsWith('institution.')) {
                populate.select[key.split('.')[1]] = 1
                delete q.fields[key]
            }
        }

        return new Promise<Child>((resolve, reject) => {
            this.Model.findOne(q.filters)
                .populate(populate)
                .exec()
                .then((result: Child) => {
                    if (!result) return resolve(undefined)

                    // Decrypt each username to compare with the username received
                    if (result.username) result.username = this._userRepository.decryptUsername(result.username)
                    return resolve(this.mapper.transform(result))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public update(item: Child): Promise<Child> {
        const itemUp: any = this.mapper.transform(item)
        return new Promise<Child>((resolve, reject) => {
            this.Model.findOneAndUpdate({ _id: itemUp.id }, itemUp, { new: true })
                .populate('institution')
                .exec()
                .then((result: Child) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.mapper.transform(result))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
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
                    this.findOne(query)
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
                this.findOne(query)
                    .then((result: Child) => {
                        if (result) return resolve(true)
                        return resolve(false)
                    })
                    .catch(err => reject(super.mongoDBErrorListener(err)))
            }
        })
    }
}
