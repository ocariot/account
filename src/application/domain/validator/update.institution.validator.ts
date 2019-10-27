import { ValidationException } from '../exception/validation.exception'
import { Institution } from '../model/institution'
import { ObjectIdValidator } from './object.id.validator'
import { Strings } from '../../../utils/strings'
import { StringValidator } from './string.validator'

export class UpdateInstitutionValidator {
    public static validate(institution: Institution): void | ValidationException {
        if (institution.id) ObjectIdValidator.validate(institution.id, Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
        if (institution.name !== undefined) {
            StringValidator.validate(institution.name, 'name')
        }
        if (institution.type !== undefined) {
            StringValidator.validate(institution.type, 'type')
        }
        if (institution.address !== undefined) {
            StringValidator.validate(institution.address, 'address')
        }
    }
}
