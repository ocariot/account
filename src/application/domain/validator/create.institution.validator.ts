import { ValidationException } from '../exception/validation.exception'
import { Institution } from '../model/institution'

export class CreateInstitutionValidator {
    public static validate(institution: Institution): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!institution.name) fields.push('name')
        if (!institution.type) fields.push('type')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Institution validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
