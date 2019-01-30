import { ValidationException } from '../exception/validation.exception'
import { HealthProfessional } from '../model/health.professional'

export class CreateHealthProfessionalValidator {
    public static validate(healthProfessional: HealthProfessional): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!healthProfessional.username) fields.push('username')
        if (!healthProfessional.password) fields.push('password')
        if (!healthProfessional.type) fields.push('type')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Health Professional validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
