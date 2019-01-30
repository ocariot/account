import bcrypt from 'bcryptjs'
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
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(educatorModel, educatorMapper, logger)
    }

    public create(item: Educator): Promise<Educator> {
        // Encrypt password
        item.password = bcrypt.hashSync(item.password, bcrypt.genSaltSync(10))
        return super.create(item)
    }

    public findById(educatorId: string): Promise<Educator> {
        const query: Query = new Query()
        query.filters = { _id: educatorId, type: UserType.EDUCATOR }
        return super.findOne(query)
    }

    public checkExist(educator: Educator): Promise<boolean> {
        const query: Query = new Query()
        if (educator.id) query.filters = { _id: educator.id }
        else query.filters = { username: educator.username }

        query.addFilter({ type: UserType.EDUCATOR })
        return new Promise<boolean>((resolve, reject) => {
            super.findOne(query)
                .then((result: Educator) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }
}
