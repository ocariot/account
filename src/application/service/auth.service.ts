import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IAuthService } from '../port/auth.service.interface'
import { IAuthRepository } from '../port/auth.repository.interface'
import { AuthValidator } from '../domain/validator/auth.validator'
import { IUserRepository } from '../port/user.repository.interface'

/**
 * Implementing auth Service.
 *
 * @implements {IChildService}
 */
@injectable()
export class AuthService implements IAuthService {

    constructor(
        @inject(Identifier.AUTH_REPOSITORY) private readonly _authRepository: IAuthRepository,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository
    ) {
    }

    public async authenticate(username: string, password: string): Promise<object> {
        try {
            AuthValidator.validate(username, password)
            const result = await this._authRepository.authenticate(username, password)
            if (result) await this._userRepository.updateLastLogin(username)
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
