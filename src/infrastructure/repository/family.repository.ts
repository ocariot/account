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
        return super.create(item)
    }

    public findById(familyId: string): Promise<Family> {
        const query: Query = new Query()
        query.filters = { _id: familyId, type: UserType.FAMILY }
        return super.findOne(query)
    }

    public checkExist(family: Family): Promise<boolean> {
        const query: Query = new Query()
        if (family.id) query.filters = { _id: family.id }
        else query.filters = { username: family.username }

        query.addFilter({ type: UserType.FAMILY })
        return new Promise<boolean>((resolve, reject) => {
            super.findOne(query)
                .then((result: Family) => {
                    if (result) return resolve(true)
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
                })
            return resolve(true)
        })
    }
}
