import { ValidationException } from '../exception/validation.exception'

export class UpdatePasswordValidator {

    public static validate(old_password: string, new_password: string): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!old_password) fields.push('old_password')
        if (!new_password) fields.push('new_password')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Change password validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
