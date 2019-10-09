import { ValidationException } from '../exception/validation.exception'
import { HealthProfessional } from '../model/health.professional'
import { CreateUserValidator } from './create.user.validator'

export class CreateHealthProfessionalValidator {
    public static validate(healthProfessional: HealthProfessional): void | ValidationException {
        const fields: Array<string> = []

        try {
            CreateUserValidator.validate(healthProfessional)
        } catch (err) {
            if (err.message !== 'REQUIRED_FIELDS') throw err
            fields.push(err.description.split(','))
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Health Professional validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
