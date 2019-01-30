import { ValidationException } from '../exception/validation.exception'
import { ChildrenGroup } from '../model/children.group'

export class ChildrenGroupValidator {
    public static validate(childrenGroup: ChildrenGroup): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!childrenGroup.name) fields.push('Name')
        if (!childrenGroup.children || childrenGroup.children.length === 0) fields.push('Children')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Children Group validation: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
