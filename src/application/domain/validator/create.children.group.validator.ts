import { ValidationException } from '../exception/validation.exception'
import { ChildrenGroup } from '../model/children.group'
import { ObjectIdValidator } from './object.id.validator'
import { Strings } from '../../../utils/strings'
import { StringValidator } from './string.validator'

export class CreateChildrenGroupValidator {
    public static validate(childrenGroup: ChildrenGroup): void | ValidationException {
        const fields: Array<string> = []
        const invalid_ids: Array<string> = []

        // validate null
        if (childrenGroup.name === undefined) fields.push('name')
        else StringValidator.validate(childrenGroup.name, 'name')

        if (childrenGroup.school_class !== undefined) {
            StringValidator.validate(childrenGroup.school_class, 'school_class')
        }

        if (!childrenGroup.user || !childrenGroup.user.id) fields.push('user')
        else ObjectIdValidator.validate(childrenGroup.user.id)

        if (!childrenGroup.children || !childrenGroup.children.length) {
            fields.push('Collection with children IDs')
        } else {
            childrenGroup.children.forEach(child => {
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
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                Strings.ERROR_MESSAGE.MULTIPLE_UUID_NOT_VALID_FORMAT.concat(invalid_ids.join(', ')))
        } else if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                fields.join(', ').concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
        }
    }
}
