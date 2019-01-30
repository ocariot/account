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
import { IUserRepository } from '../../application/port/user.repository.interface'

/**
 * Implementation of the repository for user of type Application.
 *
 * @implements {IApplicationRepository}
 */
@injectable()
export class ApplicationRepository extends BaseRepository<Application, ApplicationEntity> implements IApplicationRepository {

    constructor(
        @inject(Identifier.USER_REPO_MODEL) readonly applicationModel: any,
        @inject(Identifier.APPLICATION_ENTITY_MAPPER) readonly applicationMapper: IEntityMapper<Application, ApplicationEntity>,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(applicationModel, applicationMapper, logger)
    }

    public create(item: Application): Promise<Application> {
        // Encrypt password
        if (item.password) item.password = this._userRepository.encryptPassword(item.password)
        return super.create(item)
    }

    public checkExist(application: Application): Promise<boolean> {
        const query: Query = new Query()
        if (application.id) query.filters = { _id: application.id }
        else query.filters = { username: application.username }

        query.addFilter({ type: UserType.APPLICATION })
        return new Promise<boolean>((resolve, reject) => {
            super.findOne(query)
                .then((result: Application) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }
}
