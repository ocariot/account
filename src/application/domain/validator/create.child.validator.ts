import { ValidationException } from '../exception/validation.exception'
import { Child, Gender } from '../model/child'
import { CreateUserValidator } from './create.user.validator'
import { Strings } from '../../../utils/strings'
import { StringValidator } from './string.validator'
import { AgeDateValidator } from './age.date.validator'

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
        else {
            if (child.age !== null) child.age = child.age.toString()
            StringValidator.validate(child.age, 'age')

            // Number
            if (!isNaN(Number(child.age))) {
                if (Number(child.age) <= 0) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                        'Age cannot be less than or equal to zero!')
                }
                if (child.age_calc_date === undefined) fields.push('age_calc_date')
            }

            // Date
            else AgeDateValidator.validate(child.age, Strings.ERROR_MESSAGE.INVALID_FIELDS, Strings.ERROR_MESSAGE.INVALID_AGE)
        }

        if (child.age_calc_date !== undefined) {
            StringValidator.validate(child.age_calc_date, 'age_calc_date')
            AgeDateValidator.validate(child.age_calc_date)
        }

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                fields.join(', ').concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
        }
    }
}
