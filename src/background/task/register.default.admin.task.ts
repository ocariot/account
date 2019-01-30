import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IUserRepository } from '../../application/port/user.repository.interface'
import { ILogger } from '../../utils/custom.logger'
import { IQuery } from '../../application/port/query.interface'
import { UserType } from '../../application/domain/model/user'
import { Query } from '../../infrastructure/repository/query/query'
import { Default } from '../../utils/default'
import { Admin } from '../../application/domain/model/admin'

/**
 * In this class it's checked whether there are any admin users in the database.
 * If there is no, a default user is created.
 *
 * This task is called every time the database connection is established / reestablished.
 *
 * NOTE: The user credentials must be set in the environment variables.
 * If you are in the development environment, to make it easier, use .env,
 * if it is in production, do not use, for your own security find a more
 * secure way to configure the credentials.
 */
export class RegisterDefaultAdminTask {
    constructor(
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async run(): Promise<void> {
        const query: IQuery = new Query()
        query.filters = { type: UserType.ADMIN }

        try {
            const countUser = await this._userRepository.count(query)
            if (!countUser) {
                const userDefault: Admin = new Admin()
                userDefault.username = process.env.ADMIN_USERNAME || Default.ADMIN_USERNAME
                userDefault.password = process.env.ADMIN_PASSWORD || Default.ADMIN_PASSWORD
                userDefault.type = UserType.ADMIN

                const user = await this._userRepository.create(userDefault)
                if (!user) this._logger.error('Default admin user was not created!.')
                else this._logger.info('Default admin user created successfully.')
            }
        } catch (err) {
            this._logger.error(err.message)
            setTimeout(run, 2000)
        }
    }
}
