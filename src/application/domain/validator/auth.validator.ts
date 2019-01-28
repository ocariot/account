import { ValidationException } from '../exception/validation.exception'

export class AuthValidator {
    public static validate(username: string, password: string): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!username) fields.push('Username')
        if (!password) fields.push('Password')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Authentication validation: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}