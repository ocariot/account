import { ValidationException } from '../exception/validation.exception'
import { Institution } from '../model/institution'

export class CreateInstitutionValidator {
    public static validate(institution: Institution): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (institution.name === undefined) fields.push('name')
        else if (institution.name.length === 0) {
            throw new ValidationException('Institution name field is invalid...',
                'Institution name must have at least one character.')
        }
        if (institution.type === undefined) fields.push('type')
        else if (institution.type.length === 0) {
            throw new ValidationException('Institution type field is invalid...',
                'Institution type must have at least one character.')
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Institution validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
