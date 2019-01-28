import { ValidationException } from '../exception/validation.exception'
import { Child } from '../model/child'

export class ChildValidator {
    public static validate(child: Child): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!child.username) fields.push('Username')
        if (!child.password) fields.push('Password')
        if (!child.type) fields.push('Type')
        if (!child.gender) fields.push('Gender')
        if (!child.age) fields.push('Age')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Child validation: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
