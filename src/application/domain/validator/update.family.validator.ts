import { ValidationException } from '../exception/validation.exception'
import { UpdateUserValidator } from './update.user.validator'
import { Family } from '../model/family'
import { ObjectIdValidator } from './object.id.validator'
import { Strings } from '../../../utils/strings'

export class UpdateFamilyValidator {
    public static validate(family: Family): void | ValidationException {
        const fields: Array<string> = []
        const invalid_ids: Array<string> = []

        try {
            UpdateUserValidator.validate(family)
        } catch (err) {
            if (err.message === 'USER_ID_INVALID') {
                throw new ValidationException(Strings.FAMILY.PARAM_ID_NOT_VALID_FORMAT,
                    Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            } else if (err.message === 'INSTITUTION_ID_INVALID') {
                throw new ValidationException(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT,
                    Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            }
            throw err
        }

        if (family.children && family.children.length > 0) {
            family.children.forEach(child => {
                if (!child.id) {
                    fields.push('Collection with children IDs (ID can not be empty)')
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
            throw new ValidationException(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC,
                'Family validation: Invalid children attribute. '
                    .concat(Strings.ERROR_MESSAGE.MULTIPLE_UUID_NOT_VALID_FORMAT).concat(invalid_ids.join(', ')))
        } else if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Family validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}