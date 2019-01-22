import { ValidationException } from '../exception/validation.exception'
import { User } from '../model/user'

export class UserValidator {
    public static validate(user: User): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        // if (!user.getName()) fields.push('Name')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'User validation failed: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
