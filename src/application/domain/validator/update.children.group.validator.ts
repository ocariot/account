import { ChildrenGroup } from '../model/children.group'
import { ObjectIdValidator } from './object.id.validator'
import { ValidationException } from '../exception/validation.exception'

export class UpdateChildrenGroupValidator {
    public static validate(childrenGroup: ChildrenGroup): void | ValidationException {
        const fields: Array<string> = []

        if (childrenGroup.children && childrenGroup.children.length > 0) {
            childrenGroup.children.forEach(child => {
                if (!child.id) {
                    fields.push('Collection with children IDs (ID can not be empty)')
                    return
                } else {
                    ObjectIdValidator.validate(child.id)
                }
            })
        } else {
            fields.push('Collection with children IDs')
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Children Group validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
