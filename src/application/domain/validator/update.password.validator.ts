import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'
import { StringValidator } from './string.validator'

export class UpdatePasswordValidator {

    public static validate(old_password: string, new_password: string): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (old_password === undefined) fields.push('old_password')
        else StringValidator.validate(old_password, 'old_password')

        if (new_password === undefined) fields.push('new_password')
        else StringValidator.validate(new_password, 'new_password')

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC.replace('{0}', fields.join(', ')))
        }
    }
}
