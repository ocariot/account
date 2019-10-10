import { ValidationException } from '../exception/validation.exception'
import { Application } from '../model/application'
import { UpdateUserValidator } from './update.user.validator'
import { Strings } from '../../../utils/strings'

export class UpdateApplicationValidator {
    public static validate(application: Application): void | ValidationException {
        try {
            UpdateUserValidator.validate(application)
        } catch (err) {
            if (err.message === 'USER_ID_INVALID') {
                throw new ValidationException(Strings.APPLICATION.PARAM_ID_NOT_VALID_FORMAT,
                    Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            } else if (err.message === 'INSTITUTION_ID_INVALID') {
                throw new ValidationException(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT,
                    Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            }
            throw err
        }

        if (application.application_name !== undefined && application.application_name.length === 0) {
            throw new ValidationException('Application name field is invalid...',
                'Application name must have at least one character.')
        }
    }
}
