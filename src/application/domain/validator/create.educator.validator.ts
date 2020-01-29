import { ValidationException } from '../exception/validation.exception'
import { Educator } from '../model/educator'
import { CreateUserValidator } from './create.user.validator'
import { Strings } from '../../../utils/strings'

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
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC.replace('{0}', fields.join(', ')))
        }
    }
}
