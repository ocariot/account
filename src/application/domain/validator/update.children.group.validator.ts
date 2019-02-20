import { ChildrenGroup } from '../model/children.group'
import { ObjectIdValidator } from './object.id.validator'
import { ValidationException } from '../exception/validation.exception'

export class UpdateChildrenGroupValidator {
    public static validate(childrenGroup: ChildrenGroup): void | ValidationException {
        const fields: Array<string> = []

        if (childrenGroup.children) {
            childrenGroup.children.forEach(child => {
                if (!child.id) {
                    fields.push('Collection with children IDs (ID can not be empty)')
                } else {
                    ObjectIdValidator.validate(child.id)
                }
            })
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Children Group validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
