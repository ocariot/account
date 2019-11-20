import { ValidationException } from '../exception/validation.exception'
import { Child, Gender } from '../model/child'
import { CreateUserValidator } from './create.user.validator'
import { Strings } from '../../../utils/strings'

export class CreateChildValidator {
    public static validate(child: Child): void | ValidationException {
        const fields: Array<string> = []
        const genders: Array<string> = Object.values(Gender)

        try {
            CreateUserValidator.validate(child)
        } catch (err) {
            if (err.message !== 'REQUIRED_FIELDS') throw err
            fields.push(err.description.split(','))
        }

        if (child.gender === undefined) fields.push('gender')
        else if (!genders.includes(child.gender)) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                `The names of the allowed genders are: ${genders.join(', ')}.`)
        }
        if (child.age === undefined) fields.push('age')
        else if (child.age === null || isNaN(child.age)) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                'Provided age is not a valid number!')
        } else if (child.age <= 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                'Age cannot be less than or equal to zero!')
        }

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                fields.join(', ').concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
        }
    }
}
