import bcrypt from 'bcryptjs'
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

/**
 * Implementation of the family repository.
 *
 * @implements {IFamilyRepository}
 */
@injectable()
export class FamilyRepository extends BaseRepository<Family, FamilyEntity> implements IFamilyRepository {

    constructor(
        @inject(Identifier.USER_REPO_MODEL) readonly familyModel: any,
        @inject(Identifier.FAMILY_ENTITY_MAPPER) readonly familyMapper: IEntityMapper<Family, FamilyEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(familyModel, familyMapper, logger)
    }

    public create(item: Family): Promise<Family> {
        // Encrypt password
        item.password = bcrypt.hashSync(item.password, bcrypt.genSaltSync(10))
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
}
