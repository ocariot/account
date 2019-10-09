import { ValidationException } from '../exception/validation.exception'
import { Child, Gender } from '../model/child'
import { CreateUserValidator } from './create.user.validator'

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

        if (!child.gender) fields.push('gender')
        else if (!genders.includes(child.gender)) {
            throw new ValidationException(`The gender provided "${child.gender}" is not supported...`,
                `The names of the allowed genders are: ${genders.join(', ')}.`)
        }
        if (child.age === undefined) fields.push('age')
        else if (isNaN(child.age)) {
            throw new ValidationException('Age field is invalid...',
                'Child validation: The value provided is not a valid number!')
        } else if (child.age <= 0) {
            throw new ValidationException(`Age field is invalid...`,
                'Child validation: The age parameter can only contain a value greater than zero!')
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Child validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
