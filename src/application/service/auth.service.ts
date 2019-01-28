import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IAuthService } from '../port/auth.service.interface'
import { IAuthRepository } from '../port/auth.repository.interface'
import { AuthValidator } from '../domain/validator/auth.validator'

/**
 * Implementing auth Service.
 *
 * @implements {IChildService}
 */
@injectable()
export class AuthService implements IAuthService {

    constructor(@inject(Identifier.AUTH_REPOSITORY) private readonly _authRepository: IAuthRepository) {
    }

    public authenticate(username: string, password: string): Promise<object> {
        AuthValidator.validate(username, password)
        return this._authRepository.authenticate(username, password)
    }
}
