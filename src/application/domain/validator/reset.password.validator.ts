import { ValidationException } from '../exception/validation.exception'

export class ResetPasswordValidator {

    public static validate(new_password: string): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (new_password === undefined) fields.push('new_password')
        else if (new_password.length === 0) {
            throw new ValidationException('New password field is invalid...',
                'The new password must have at least one character.')
        }

        if (fields.length > 0) {
            throw new ValidationException('Required field not provided...',
                'Reset password validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
