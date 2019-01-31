import jwt from 'jsonwebtoken'
import { inject, injectable } from 'inversify'
import { ILogger } from '../../utils/custom.logger'
import { Identifier } from '../../di/identifiers'
import { IAuthRepository } from '../../application/port/auth.repository.interface'
import { User } from '../../application/domain/model/user'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { UserEntity } from '../entity/user.entity'
import { Default } from '../../utils/default'
import { RepositoryException } from '../../application/domain/exception/repository.exception'
import { Strings } from '../../utils/strings'
import { IUserRepository } from '../../application/port/user.repository.interface'

/**
 * Implementation of the auth repository.
 *
 * @implements {IAuthRepository}
 */
@injectable()
export class AuthRepository implements IAuthRepository {

    constructor(
        @inject(Identifier.USER_REPO_MODEL) readonly userModel: any,
        @inject(Identifier.USER_ENTITY_MAPPER) readonly userMapper: IEntityMapper<User, UserEntity>,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
    }

    public authenticate(_username: string, password: string): Promise<object> {
        return new Promise<object>((resolve, reject) => {
            this.userModel.findOne({ username: _username })
                .then(result => {
                    if (result) {
                        const user: User = this.userMapper.transform(result)

                        // Validate password and generate access token.
                        if (!user.password) return resolve(undefined)
                        if (this._userRepository.comparePasswords(password, user.password)) {
                            return resolve({ access_token: this.generateAccessToken(user) })
                        }
                    }
                    resolve(undefined)
                })
                .catch(err => {
                    reject(new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED))
                })
        })
    }

    public generateAccessToken(user: User): string {
        const secret: string = process.env.JWT_SECRET || Default.JWT_SECRET
        const payload: object = {
            sub: user.id,
            iss: process.env.ISSUER || Default.JWT_ISSUER,
            iat: Math.floor(Date.now() / 1000),
            scope: user.scopes.join(' ')
        }
        return jwt.sign(payload, secret, { expiresIn: '1d' })
    }
}
