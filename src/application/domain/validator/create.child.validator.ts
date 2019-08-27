import { ValidationException } from '../exception/validation.exception'
import { Child, Gender } from '../model/child'
import { ObjectIdValidator } from './object.id.validator'

export class CreateChildValidator {
    public static validate(child: Child): void | ValidationException {
        const fields: Array<string> = []
        const genders = Object.values(Gender)

        // validate null
        if (!child.username) fields.push('username')
        if (!child.password) fields.push('password')
        if (!child.type) fields.push('type')
        if (!child.institution || !child.institution.id) fields.push('institution')
        else ObjectIdValidator.validate(child.institution.id)
        if (!child.gender) fields.push('gender')
        else if (!genders.includes(child.gender)) {
            throw new ValidationException(`The gender provided "${child.gender}" is not supported...`,
                `The names of the allowed genders are: ${genders.join(', ')}.`)
        }
        if (child.age === undefined) fields.push('age')
        else if (child.age <= 0) {
            throw new ValidationException(`Age field is invalid...`,
                'Child validation: The age parameter can only contain a value greater than zero')
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Child validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
