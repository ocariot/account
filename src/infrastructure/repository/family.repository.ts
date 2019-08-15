import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { UserType } from '../../application/domain/model/user'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Identifier } from '../../di/identifiers'
import { Query } from './query/query'
import { IFamilyRepository } from '../../application/port/family.repository.interface'
import { Family } from '../../application/domain/model/family'
import { FamilyEntity } from '../entity/family.entity'
import { IUserRepository } from '../../application/port/user.repository.interface'
import { IQuery } from '../../application/port/query.interface'

/**
 * Implementation of the family repository.
 * @implements {IFamilyRepository}
 */
@injectable()
export class FamilyRepository extends BaseRepository<Family, FamilyEntity> implements IFamilyRepository {

    constructor(
        @inject(Identifier.USER_REPO_MODEL) readonly familyModel: any,
        @inject(Identifier.FAMILY_ENTITY_MAPPER) readonly familyMapper: IEntityMapper<Family, FamilyEntity>,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(familyModel, familyMapper, logger)
    }

    public create(item: Family): Promise<Family> {
        // Encrypt password
        if (item.password) item.password = this._userRepository.encryptPassword(item.password)
        const itemNew: Family = this.mapper.transform(item)
        return new Promise<Family>((resolve, reject) => {
            this.familyModel.create(itemNew)
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

    public find(query: IQuery): Promise<Array<Family>> {
        const q: any = query.toJSON()
        const populate: any = { path: 'children' }

        return new Promise<Array<Family>>((resolve, reject) => {
            this.familyModel.find(q.filters)
                .sort(q.ordination)
                .skip(Number((q.pagination.limit * q.pagination.page) - q.pagination.limit))
                .limit(Number(q.pagination.limit))
                .populate(populate)
                .exec()
                .then((result: Array<Family>) => {
                    resolve(result.map(item => this.mapper.transform(item)))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public findOne(query: IQuery): Promise<Family> {
        const q: any = query.toJSON()
        const populate: any = { path: 'children' }

        return new Promise<Family>((resolve, reject) => {
            this.familyModel.findOne(q.filters)
                .populate(populate)
                .exec()
                .then((result: Family) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.mapper.transform(result))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public update(item: Family): Promise<Family> {
        const itemUp: any = this.mapper.transform(item)
        const populate: any = { path: 'children' }

        return new Promise<Family>((resolve, reject) => {
            this.familyModel.findOneAndUpdate({ _id: itemUp.id }, itemUp, { new: true })
                .populate(populate)
                .exec()
                .then((result: Family) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.mapper.transform(result))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public findById(familyId: string): Promise<Family> {
        const query: Query = new Query()
        query.filters = { _id: familyId, type: UserType.FAMILY }
        return this.findOne(query)
    }

    public checkExist(family: Family): Promise<boolean> {
        const query: Query = new Query()
        if (family.id) query.filters = { _id: family.id }

        query.addFilter({ type: UserType.FAMILY })
        return new Promise<boolean>((resolve, reject) => {
            this.find(query)
                .then((result: Array<Family>) => {
                    if (family.id) {
                        if (result.length > 0) return resolve(true)
                        return resolve(false)
                    }
                    for (const familyItem of result) {
                        if (familyItem.username === family.username) return resolve(true)
                    }
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public disassociateChildFromFamily(childId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            return this.familyModel.updateMany({ children: { $in: childId } },
                { $pullAll: { children: [childId] } },
                { multi: true }, (err) => {
                    if (err) return reject(super.mongoDBErrorListener(err))
                    return resolve(true)
                })
        })
    }
}
