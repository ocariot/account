import { ValidationException } from '../exception/validation.exception'
import { Application } from '../model/application'

export class ApplicationValidator {
    public static validate(application: Application): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!application.application_name) fields.push('Application Name')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Application validation: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
