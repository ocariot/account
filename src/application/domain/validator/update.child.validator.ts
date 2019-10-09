import { ValidationException } from '../exception/validation.exception'
import { UpdateUserValidator } from './update.user.validator'
import { Child, Gender } from '../model/child'
import { Strings } from '../../../utils/strings'

export class UpdateChildValidator {
    public static validate(child: Child): void | ValidationException {
        const genders: Array<string> = Object.values(Gender)

        try {
            UpdateUserValidator.validate(child)
        } catch (err) {
            if (err.message === 'USER_ID_INVALID') {
                throw new ValidationException(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                    Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            } else if (err.message === 'INSTITUTION_ID_INVALID') {
                throw new ValidationException(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT,
                    Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            }
            throw err
        }

        if (child.gender && !genders.includes(child.gender)) {
            throw new ValidationException(`The gender provided "${child.gender}" is not supported...`,
                `The names of the allowed genders are: ${genders.join(', ')}.`)
        }

        if (child.age) {
            if (isNaN(child.age)) {
                throw new ValidationException('Age field is invalid...',
                    'Child validation: The value provided is not a valid number!')
            } else if (child.age && child.age <= 0) {
                throw new ValidationException(`Age field is invalid...`,
                    'Child validation: The age parameter can only contain a value greater than zero!')
            }
        }
    }
}
