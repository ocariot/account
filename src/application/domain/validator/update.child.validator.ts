import { ValidationException } from '../exception/validation.exception'
import { UpdateUserValidator } from './update.user.validator'
import { Child, Gender } from '../model/child'
import { Strings } from '../../../utils/strings'
import { StringValidator } from './string.validator'
import { AgeDateValidator } from './age.date.validator'

export class UpdateChildValidator {
    public static validate(child: Child): void | ValidationException {
        const fields: Array<string> = []
        const genders: Array<string> = Object.values(Gender)

        try {
            UpdateUserValidator.validate(child)
        } catch (err) {
            if (err.message === 'USER_ID_INVALID') {
                throw new ValidationException(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                    Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            } else if (err.message === 'INSTITUTION_ID_INVALID') {
                throw new ValidationException(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT,
                    Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            }
            throw err
        }

        if (child.gender !== undefined && !genders.includes(child.gender)) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                `The names of the allowed genders are: ${genders.join(', ')}.`)
        }

        if (child.age !== undefined) {
            child.age = child.age.toString()
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
            if (child.age === undefined) fields.push('age')
        }

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                fields.join(', ').concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
        }
    }
}
