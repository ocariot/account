import { ValidationException } from '../exception/validation.exception'
import { Educator } from '../model/educator'
import { ObjectIdValidator } from './object.id.validator'

export class CreateEducatorValidator {
    public static validate(educator: Educator): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!educator.username) fields.push('username')
        if (!educator.password) fields.push('password')
        if (!educator.type) fields.push('type')
        if (!educator.institution || !educator.institution.id) fields.push('institution')
        else ObjectIdValidator.validate(educator.institution.id)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Educator validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
