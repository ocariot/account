import { ValidationException } from '../exception/validation.exception'
import { Child } from '../model/child'

export class CreateChildValidator {
    public static validate(child: Child): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!child.username) fields.push('username')
        if (!child.password) fields.push('password')
        if (!child.type) fields.push('type')
        if (!child.institution || !child.institution.id) fields.push('institution')
        if (!child.gender) fields.push('gender')
        if (!child.age) fields.push('age')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Child validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
