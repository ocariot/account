import { ChildrenGroup } from '../model/children.group'
import { ObjectIdValidator } from './object.id.validator'
import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'
import { StringValidator } from './string.validator'

export class UpdateChildrenGroupValidator {
    public static validate(childrenGroup: ChildrenGroup): void | ValidationException {
        const fields: Array<string> = []
        const invalid_ids: Array<string> = []

        if (childrenGroup.id) ObjectIdValidator.validate(childrenGroup.id, Strings.CHILDREN_GROUP.PARAM_ID_NOT_VALID_FORMAT)
        if (childrenGroup.name !== undefined) {
            StringValidator.validate(childrenGroup.name, 'name')
        }
        if (childrenGroup.school_class !== undefined) {
            StringValidator.validate(childrenGroup.school_class, 'school_class')
        }
        if (childrenGroup.children !== undefined && !(childrenGroup.children instanceof Array)) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                'children'.concat(Strings.ERROR_MESSAGE.INVALID_ARRAY))
        }
        if (childrenGroup.children && childrenGroup.children.length > 0) {
            childrenGroup.children.forEach(child => {
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
                Strings.ERROR_MESSAGE.MULTIPLE_UUID_NOT_VALID_FORMAT.concat(invalid_ids.join(', ')))
        } else if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                fields.join(', ').concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
        }
    }
}
