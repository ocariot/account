import { ValidationException } from '../exception/validation.exception'
import { Family } from '../model/family'
import { ObjectIdValidator } from './object.id.validator'

export class CreateFamilyValidator {
    public static validate(family: Family): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!family.username) fields.push('username')
        if (!family.password) fields.push('password')
        if (!family.type) fields.push('type')
        if (!family.institution || !family.institution.id) fields.push('institution')
        if (!family.children || !family.children.length) {
            fields.push('Collection with children IDs')
        } else {
            family.children.forEach(child => {
                if (!child.id) {
                    fields.push('Collection with children IDs (ID can not be empty)')
                } else {
                    ObjectIdValidator.validate(child.id)
                }
            })
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Family validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
