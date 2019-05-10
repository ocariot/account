import { ValidationException } from '../exception/validation.exception'
import { HealthProfessional } from '../model/health.professional'
import { ObjectIdValidator } from './object.id.validator'

export class CreateHealthProfessionalValidator {
    public static validate(healthProfessional: HealthProfessional): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!healthProfessional.username) fields.push('username')
        if (!healthProfessional.password) fields.push('password')
        if (!healthProfessional.type) fields.push('type')
        if (!healthProfessional.institution || !healthProfessional.institution.id) fields.push('institution')
        else ObjectIdValidator.validate(healthProfessional.institution.id)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Health Professional validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
