import { ValidationException } from '../exception/validation.exception'
import { Family } from '../model/family'
import { ObjectIdValidator } from './object.id.validator'
import { CreateUserValidator } from './create.user.validator'
import { Strings } from '../../../utils/strings'

export class CreateFamilyValidator {
    public static validate(family: Family): void | ValidationException {
        const fields: Array<string> = []
        const invalid_ids: Array<string> = []

        try {
            CreateUserValidator.validate(family)
        } catch (err) {
            if (err.message !== 'REQUIRED_FIELDS') throw err
            fields.push(err.description.split(','))
        }

        if (family.children !== undefined && !(family.children instanceof Array)) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                Strings.ERROR_MESSAGE.INVALID_ARRAY.replace('{0}', 'children'))
        }

        if (!family.children || !family.children.length) {
            fields.push('Collection with children IDs')
        } else {
            family.children.forEach(child => {
                if (!child.id) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                        Strings.ERROR_MESSAGE.INVALID_MULTIPLE_UUID)
                } else {
                    try {
                        ObjectIdValidator.validate(child.id)
                    } catch (err) {
                        invalid_ids.push(child.id)
                    }
                }
            })
        }

        if (invalid_ids.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                Strings.ERROR_MESSAGE.MULTIPLE_UUID_NOT_VALID_FORMAT.replace('{0}', invalid_ids.join(', ')))
        } else if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC.replace('{0}', fields.join(', ')))
        }
    }
}
