import { ValidationException } from '../exception/validation.exception'
import { UpdateUserValidator } from './update.user.validator'
import { Educator } from '../model/educator'
import { Strings } from '../../../utils/strings'

export class UpdateEducatorValidator {
    public static validate(educator: Educator): void | ValidationException {
        try {
            UpdateUserValidator.validate(educator)
        } catch (err) {
            if (err.message === 'USER_ID_INVALID') {
                throw new ValidationException(Strings.EDUCATOR.PARAM_ID_NOT_VALID_FORMAT,
                    Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            } else if (err.message === 'INSTITUTION_ID_INVALID') {
                throw new ValidationException(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT,
                    Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            }
            throw err
        }
    }
}
