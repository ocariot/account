import { ValidationException } from '../exception/validation.exception'
import { HealthProfessional } from '../model/health.professional'

export class HealthProfessionalValidator {
    public static validate(healthProfessional: HealthProfessional): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!healthProfessional.username) fields.push('Username')
        if (!healthProfessional.password) fields.push('Password')
        if (!healthProfessional.type) fields.push('Type')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Health Professional validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
