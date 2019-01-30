import bcrypt from 'bcryptjs'
import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { UserType } from '../../application/domain/model/user'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Identifier } from '../../di/identifiers'
import { Query } from './query/query'
import { HealthProfessional } from '../../application/domain/model/health.professional'
import { HealthProfessionalEntity } from '../entity/health.professional.entity'
import { IHealthProfessionalRepository } from '../../application/port/health.professional.repository.interface'

/**
 * Implementation of the Health Professional repository.
 *
 * @implements {IHealthProfessionalRepository}
 */
@injectable()
export class HealthProfessionalRepository extends BaseRepository<HealthProfessional, HealthProfessionalEntity>
    implements IHealthProfessionalRepository {

    constructor(
        @inject(Identifier.USER_REPO_MODEL) readonly healthProfessionalModel: any,
        @inject(Identifier.HEALTH_PROFESSIONAL_ENTITY_MAPPER) readonly healthProfessionalMapper:
            IEntityMapper<HealthProfessional, HealthProfessionalEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(healthProfessionalModel, healthProfessionalMapper, logger)
    }

    public create(item: HealthProfessional): Promise<HealthProfessional> {
        // Encrypt password
        item.password = bcrypt.hashSync(item.password, bcrypt.genSaltSync(10))
        return super.create(item)
    }

    public findById(healthProfessionalId: string): Promise<HealthProfessional> {
        const query: Query = new Query()
        query.filters = { _id: healthProfessionalId, type: UserType.HEALTH_PROFESSIONAL }
        return super.findOne(query)
    }

    public checkExist(healthProfessional: HealthProfessional): Promise<boolean> {
        const query: Query = new Query()
        if (healthProfessional.id) query.filters = { _id: healthProfessional.id }
        else query.filters = { username: healthProfessional.username }

        query.addFilter({ type: UserType.HEALTH_PROFESSIONAL })
        return new Promise<boolean>((resolve, reject) => {
            super.findOne(query)
                .then((result: HealthProfessional) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }
}
