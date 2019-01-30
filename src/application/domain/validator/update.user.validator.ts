import { ValidationException } from '../exception/validation.exception'
import { User } from '../model/user'

export class UpdateUserValidator {
    public static validate(user: User): void | ValidationException {
        // validate parameters that can not be updated.
        if (user.password) {
            throw new ValidationException('This parameter could not be updated.',
                'A specific route to update user password already exists.' +
                `Access: PATCH /users/${user.id}/password to update your password.`)
        }
    }
}
