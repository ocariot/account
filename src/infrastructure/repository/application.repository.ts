import bcrypt from 'bcryptjs'
import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { UserType } from '../../application/domain/model/user'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Identifier } from '../../di/identifiers'
import { Query } from './query/query'
import { IApplicationRepository } from '../../application/port/application.repository.interface'
import { Application } from '../../application/domain/model/application'
import { ApplicationEntity } from '../entity/application.entity'

/**
 * Implementation of the repository for user of type Application.
 *
 * @implements {IApplicationRepository}
 */
@injectable()
export class ApplicationRepository extends BaseRepository<Application, ApplicationEntity> implements IApplicationRepository {

    constructor(
        @inject(Identifier.USER_REPO_MODEL) readonly applicationModel: any,
        @inject(Identifier.CHILD_ENTITY_MAPPER) readonly childMapper: IEntityMapper<Application, ApplicationEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(applicationModel, childMapper, logger)
    }

    public create(item: Application): Promise<Application> {
        // Encrypt password
        item.password = bcrypt.hashSync(item.password, bcrypt.genSaltSync(10))
        return super.create(item)
    }

    public checkExist(application: Application): Promise<boolean> {
        const query: Query = new Query()
        return new Promise<boolean>((resolve, reject) => {
            if (application.id) query.filters = { _id: application.id }
            else query.filters = { username: application.username }

            query.addFilter({ type: UserType.FAMILY })
            super.findOne(query)
                .then((result: Application) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }
}
