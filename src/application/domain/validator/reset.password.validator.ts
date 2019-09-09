import { ValidationException } from '../exception/validation.exception'

export class ResetPasswordValidator {

    public static validate(new_password: string): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!new_password) fields.push('new_password')

        if (fields.length > 0) {
            throw new ValidationException('Required field not provided...',
                'Reset password validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
