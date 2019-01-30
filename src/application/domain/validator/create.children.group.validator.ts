import { ValidationException } from '../exception/validation.exception'
import { ChildrenGroup } from '../model/children.group'

export class CreateChildrenGroupValidator {
    public static validate(childrenGroup: ChildrenGroup): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!childrenGroup.name) fields.push('name')
        if (!childrenGroup.children || !childrenGroup.children.length) {
            fields.push('Collection with children IDs')
        } else {
            childrenGroup.children.forEach(child => {
                if (!child.id) {
                    fields.push('Collection with children IDs (ID can not be empty)')
                }
            })
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Children Group validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
