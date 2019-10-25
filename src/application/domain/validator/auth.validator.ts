import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'
import { StringValidator } from './string.validator'

export class AuthValidator {
    public static validate(username: string, password: string): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (username === undefined) fields.push('username')
        else StringValidator.validate(username, 'username')
        if (password === undefined) fields.push('password')
        else StringValidator.validate(password, 'password')

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                fields.join(', ').concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
        }
    }
}
