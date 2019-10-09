import { ValidationException } from '../exception/validation.exception'
import { Institution } from '../model/institution'
import { ObjectIdValidator } from './object.id.validator'
import { Strings } from '../../../utils/strings'

export class UpdateInstitutionValidator {
    public static validate(institution: Institution): void | ValidationException {
        if (institution.id) ObjectIdValidator.validate(institution.id, Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
        if (institution.name !== undefined && institution.name.length === 0) {
            throw new ValidationException('Institution name field is invalid...',
                'Institution name must be at least one character.')
        }
        if (institution.type !== undefined && institution.type.length === 0) {
            throw new ValidationException('Institution type field is invalid...',
                'Institution type must be at least one character.')
        }
    }
}
