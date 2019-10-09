import { ChildrenGroup } from '../model/children.group'
import { ObjectIdValidator } from './object.id.validator'
import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class UpdateChildrenGroupValidator {
    public static validate(childrenGroup: ChildrenGroup): void | ValidationException {
        const fields: Array<string> = []
        const invalid_ids: Array<string> = []

        if (childrenGroup.name !== undefined && childrenGroup.name.length === 0) {
            throw new ValidationException('ChildrenGroup name field is invalid...',
                'ChildrenGroup name must be at least one character.')
        }
        if (childrenGroup.children && childrenGroup.children.length > 0) {
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
            throw new ValidationException(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC,
                'Children Group validation: Invalid children attribute. '
                    .concat(Strings.ERROR_MESSAGE.MULTIPLE_UUID_NOT_VALID_FORMAT).concat(invalid_ids.join(', ')))
        } else if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Children Group validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
