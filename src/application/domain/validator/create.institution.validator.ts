import { ValidationException } from '../exception/validation.exception'
import { Institution } from '../model/institution'
import { StringValidator } from './string.validator'
import { Strings } from '../../../utils/strings'

export class CreateInstitutionValidator {
    public static validate(institution: Institution): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (institution.name === undefined) fields.push('name')
        else StringValidator.validate(institution.name, 'name')

        if (institution.type === undefined) fields.push('type')
        else StringValidator.validate(institution.type, 'type')

        if (institution.address !== undefined) StringValidator.validate(institution.address, 'address')

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                fields.join(', ').concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
        }
    }
}
