import { ValidationException } from '../exception/validation.exception'
import { Application } from '../model/application'

export class ApplicationValidator {
    public static validate(application: Application): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!application.username) fields.push('Username')
        if (!application.password) fields.push('Password')
        if (!application.type) fields.push('Type')
        if (!application.application_name) fields.push('Application Name')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Application validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
