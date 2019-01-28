import { ValidationException } from '../exception/validation.exception'
import { Educator } from '../model/educator'

export class EducatorValidator {
    public static validate(educator: Educator): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!educator.username) fields.push('Username')
        if (!educator.password) fields.push('Password')
        if (!educator.type) fields.push('Type')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Educator validation: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
