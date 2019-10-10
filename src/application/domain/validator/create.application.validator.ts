import { ValidationException } from '../exception/validation.exception'
import { Application } from '../model/application'
import { CreateUserValidator } from './create.user.validator'

export class CreateApplicationValidator {
    public static validate(application: Application): void | ValidationException {
        const fields: Array<string> = []

        try {
            CreateUserValidator.validate(application)
        } catch (err) {
            if (err.message !== 'REQUIRED_FIELDS') throw err
            fields.push(err.description.split(','))
        }

        if (application.application_name === undefined) fields.push('application_name')
        else if (application.application_name.length === 0) {
            throw new ValidationException('Application name field is invalid...',
                'Application name must have at least one character.')
        }
        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Application validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
