import { ValidationException } from '../exception/validation.exception'

export class UpdatePasswordValidator {

    public static validate(old_password: string, new_password: string): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (old_password === undefined) fields.push('old_password')
        else if (old_password.length === 0) {
            throw new ValidationException('Old password field is invalid...',
                'The old password must have at least one character.')
        }

        if (new_password === undefined) fields.push('new_password')
        else if (new_password.length === 0) {
            throw new ValidationException('New password field is invalid...',
                'The new password must have at least one character.')
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Change password validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
