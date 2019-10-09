import { ValidationException } from '../exception/validation.exception'
import { Educator } from '../model/educator'
import { CreateUserValidator } from './create.user.validator'

export class CreateEducatorValidator {
    public static validate(educator: Educator): void | ValidationException {
        const fields: Array<string> = []

        try {
            CreateUserValidator.validate(educator)
        } catch (err) {
            if (err.message !== 'REQUIRED_FIELDS') throw err
            fields.push(err.description.split(','))
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Educator validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
