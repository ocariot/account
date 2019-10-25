import { ValidationException } from '../exception/validation.exception'
import { StringValidator } from './string.validator'

export class ResetPasswordValidator {

    public static validate(new_password: string): void | ValidationException {
        // validate null
        if (new_password === undefined) {
            throw new ValidationException('Required field not provided...',
                'new_password is required!')
        }
        else StringValidator.validate(new_password, 'new_password')
    }
}
