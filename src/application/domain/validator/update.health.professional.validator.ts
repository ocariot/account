import { ValidationException } from '../exception/validation.exception'
import { UpdateUserValidator } from './update.user.validator'
import { HealthProfessional } from '../model/health.professional'
import { Strings } from '../../../utils/strings'

export class UpdateHealthProfessionalValidator {
    public static validate(healthProfessional: HealthProfessional): void | ValidationException {
        try {
            UpdateUserValidator.validate(healthProfessional)
        } catch (err) {
            if (err.message === 'USER_ID_INVALID') {
                throw new ValidationException(Strings.HEALTH_PROFESSIONAL.PARAM_ID_NOT_VALID_FORMAT,
                    Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            } else if (err.message === 'INSTITUTION_ID_INVALID') {
                throw new ValidationException(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT,
                    Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            }
            throw err
        }
    }
}
