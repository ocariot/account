import { ValidationException } from '../exception/validation.exception'
import { Application } from '../model/application'

export class CreateApplicationValidator {
    public static validate(application: Application): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!application.username) fields.push('username')
        if (!application.password) fields.push('password')
        if (!application.type) fields.push('type')
        if (!application.application_name) fields.push('application_name')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Application validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
