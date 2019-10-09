import { ValidationException } from '../exception/validation.exception'
import { ObjectIdValidator } from './object.id.validator'
import { User, UserType } from '../model/user'
import { Strings } from '../../../utils/strings'

export class CreateUserValidator {
    public static validate(user: User): void | ValidationException {
        const fields: Array<string> = []
        try {
            // validate null
            if (user.username === undefined) fields.push('username')
            else if (user.username.length === 0) {
                throw new ValidationException('Username field is invalid...',
                    'Username must be at least one character.')
            }
            if (!user.password) fields.push('password')
            if (!user.type) fields.push('type')
            if (!user.institution || !user.institution.id) {
                if (user.type !== UserType.APPLICATION) fields.push('institution')
            }
            else ObjectIdValidator.validate(user.institution.id, Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
            if (fields.length > 0) throw new ValidationException('REQUIRED_FIELDS', fields.join(', '))
        } catch (err) {
            throw err
        }
    }
}
