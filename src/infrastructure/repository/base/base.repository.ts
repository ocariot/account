import { injectable } from 'inversify'
import { IRepository } from '../../../application/port/repository.interface'
import { RepositoryException } from '../../../application/domain/exception/repository.exception'
import { Entity } from '../../../application/domain/model/entity'
import { ValidationException } from '../../../application/domain/exception/validation.exception'
import { ConflictException } from '../../../application/domain/exception/conflict.exception'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { IQuery } from '../../../application/port/query.interface'
import { ILogger } from '../../../utils/custom.logger'
import { Query } from '../query/query'
import { Strings } from '../../../utils/strings'
import { UserType } from '../../../application/domain/model/user'

/**
 * Base implementation of the repository.
 *
 * @implements {IRepository<T>}
 * @template <T extends Entity, TModel extends Document>
 */
@injectable()
export abstract class BaseRepository<T extends Entity, TModel> implements IRepository<T> {

    protected constructor(
        readonly Model: any,
        readonly mapper: IEntityMapper<T, TModel>,
        readonly logger: ILogger
    ) {
    }

    public create(item: T): Promise<T> {
        const itemNew: TModel = this.mapper.transform(item)
        return new Promise<T>((resolve, reject) => {
            this.Model.create(itemNew)
                .then((result) => {
                    // Required due to 'populate ()' routine.
                    // If there is no need for 'populate ()', the return will suffice.
                    const query = new Query()
                    query.filters = { _id: result._id }
                    return resolve(this.findOne(query))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public find(query: IQuery): Promise<Array<T>> {
        const q: any = query.toJSON()
        return new Promise<Array<T>>((resolve, reject) => {
            this.Model.find(q.filters)
                .collation({ locale: 'en', caseLevel: true, numericOrdering: true, strength: 2 })
                .sort(q.ordination)
                .skip(Number((q.pagination.limit * q.pagination.page) - q.pagination.limit))
                .limit(Number(q.pagination.limit))
                .exec() // execute query
                .then((result: Array<TModel>) => resolve(result.map(item => this.mapper.transform(item))))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public findAll(query: IQuery): Promise<Array<T>> {
        const q: any = query.toJSON()
        const populate: any = this.buildPopulateByUserType(q.filters.type)

        // Auxiliar logic for pagination
        const page: number = q.pagination.page

        // Checks if you have username in filters
        let usernameFilter: any
        const limit: number = q.pagination.limit
        if (q.filters.username) {
            usernameFilter = q.filters.username
            delete q.filters.username
            q.pagination.limit = Number.MAX_SAFE_INTEGER
            if (q.pagination.page > 1) q.pagination.page = 1
        }

        // Checks if you have username in ordination/sort
        let usernameOrder: string
        if (q.ordination.username) {
            usernameOrder = q.ordination.username
            q.ordination = {}
            q.pagination.limit = Number.MAX_SAFE_INTEGER
            if (q.pagination.page > 1) q.pagination.page = 1
        }

        return new Promise<Array<T>>(async (resolve, reject) => {
            try {
                let users: Array<any> = await this.findPopulate(q, populate)
                if (!usernameFilter && !usernameOrder) {
                    return resolve(users.map(item => this.mapper.transform(item)))
                }

                if (usernameFilter) users = this.applyFilterByUsername(usernameFilter, users)

                if (usernameOrder) {
                    if (usernameOrder === 'asc') users.sort(this.compareAsc)
                    else users.sort(this.compareDesc)
                }

                if (users.length > limit) {
                    const start = (limit * page) - limit
                    users = users.slice(start, limit + start)
                }

                return resolve(users.map(item => this.mapper.transform(item)))
            } catch (err) {
                return reject(err)
            }
        })
    }

    public findOne(query: IQuery): Promise<T> {
        const q: any = query.toJSON()
        return new Promise<T>((resolve, reject) => {
            this.Model.findOne(q.filters)
                .exec()
                .then((result: TModel) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.mapper.transform(result))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public update(item: T): Promise<T> {
        const itemUp: any = this.mapper.transform(item)
        return new Promise<T>((resolve, reject) => {
            this.Model.findOneAndUpdate({ _id: itemUp.id }, itemUp, { new: true })
                .exec()
                .then((result: TModel) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.mapper.transform(result))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public delete(id: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.Model.findOneAndDelete({ _id: id })
                .exec()
                .then((result: TModel) => {
                    if (!result) return resolve(false)
                    resolve(true)
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public count(query: IQuery): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.Model.countDocuments(query.toJSON().filters)
                .exec()
                .then(result => resolve(Number(result)))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    protected mongoDBErrorListener(err: any): ValidationException | ConflictException | RepositoryException | undefined {
        if (err && err.name) {
            if (err.name === 'ValidationError') {
                return new ValidationException('Required fields were not provided!', err.message)
            } else if (err.name === 'CastError' || new RegExp(/(invalid format)/i).test(err)) {
                if (err.name === 'CastError' && err.kind) {
                    if (err.kind === 'date') {
                        return new ValidationException(`Datetime: ${err.value}`.concat(Strings.ERROR_MESSAGE.INVALID_DATE),
                            Strings.ERROR_MESSAGE.INVALID_DATE_DESC)
                    } else if (err.kind === 'ObjectId') {
                        return new ValidationException(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                            Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    } else if (err.kind === 'number') {
                        return new ValidationException(`The value \'${err.value}\' of ${err.path} field is not a number.`)
                    }
                }
                return new ValidationException(`The value \'${err.value}\' of ${err.path} field is invalid.`)
            } else if (err.name === 'MongoError' && err.code === 11000) {
                return new ConflictException('A registration with the same unique data already exists!')
            } else if (err.name === 'ObjectParameterError') {
                return new ValidationException('Invalid query parameters!')
            }
        }
        return new RepositoryException(err && err.message ? err.message : Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
            err && err.description ? err.description : undefined)
    }

    private findPopulate(q: any, populate?: any): Promise<Array<T>> {
        return new Promise<Array<T>>((resolve, reject) => {
            this.Model.find(q.filters)
                .collation({ locale: 'en', caseLevel: true, numericOrdering: true, strength: 2 })
                .sort(q.ordination)
                .skip(Number((q.pagination.limit * q.pagination.page) - q.pagination.limit))
                .limit(Number(q.pagination.limit))
                .populate(populate)
                .exec() // execute query
                .then(resolve)
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public applyFilterByUsername(username: any, items: any): any {
        let regExpUsername: RegExp
        if (username.$regex) regExpUsername = new RegExp(username.$regex, 'i')
        return items
            .filter((elem: any) => {
                if (regExpUsername) return regExpUsername.test(elem.username)
                return elem.username.toString().toLowerCase() === username.toString().toLowerCase()
            })
    }

    public compareAsc(previous: any, next: any): number {
        if (previous.username.toLowerCase() > next.username.toLowerCase()) return 1
        if (previous.username.toLowerCase() < next.username.toLowerCase()) return -1
        return 0
    }

    public compareDesc(previous: any, next: any): number {
        if (previous.username.toLowerCase() > next.username.toLowerCase()) return -1
        if (previous.username.toLowerCase() < next.username.toLowerCase()) return 1
        return 0
    }

    /**
     * Check user type for mounting populate object.
     * @param userType
     * @return object | undefined
     */
    private buildPopulateByUserType(userType: string): object | undefined {
        if (userType === UserType.FAMILY) return { path: 'children' }
        if (userType === UserType.EDUCATOR || userType === UserType.HEALTH_PROFESSIONAL) {
            return {
                path: 'children_groups',
                populate: { path: 'children' }
            }
        }
        return undefined
    }
}
