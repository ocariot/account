import { ValidationException } from '../exception/validation.exception'
import { Application } from '../model/application'
import { CreateUserValidator } from './create.user.validator'
import { StringValidator } from './string.validator'
import { Strings } from '../../../utils/strings'

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
        else StringValidator.validate(application.application_name, 'application_name')

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC.replace('{0}', fields.join(', ')))
        }
    }
}
