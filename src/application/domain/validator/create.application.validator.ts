import { ValidationException } from '../exception/validation.exception'
import { Application } from '../model/application'
import { ObjectIdValidator } from './object.id.validator'

export class CreateApplicationValidator {
    public static validate(application: Application): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!application.username) fields.push('username')
        if (!application.password) fields.push('password')
        if (!application.type) fields.push('type')
        if (!application.application_name) fields.push('application_name')
        if (application.institution && application.institution.id) ObjectIdValidator.validate(application.institution.id)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Application validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
