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
        if (institution.latitude !== undefined) StringValidator.validate(institution.latitude, 'latitude')
        if (institution.longitude !== undefined) StringValidator.validate(institution.longitude, 'longitude')

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC.replace('{0}', fields.join(', ')))
        }
    }
}
