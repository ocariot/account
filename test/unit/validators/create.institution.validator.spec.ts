import { CreateInstitutionValidator } from '../../../src/application/domain/validator/create.institution.validator'
import { Institution } from '../../../src/application/domain/model/institution'
import { assert } from 'chai'
import { InstitutionMock } from '../../mocks/institution.mock'
import { Strings } from '../../../src/utils/strings'

describe('Validators: Institution', () => {
    const institution: Institution = new InstitutionMock()

    context('when the validation was successful', () => {
        it('should return undefined', () => {
            const result = CreateInstitutionValidator.validate(institution)
            assert.equal(result, undefined)
        })
    })

    context('when the institution was incomplete', () => {
        it('should throw an error for does not pass name', () => {
            institution.name = undefined

            try {
                CreateInstitutionValidator.validate(institution)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'name'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass type', () => {
            institution.name = 'institution'
            institution.type = undefined

            try {
                CreateInstitutionValidator.validate(institution)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'type'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass any of required parameters', () => {
            institution.name = undefined

            try {
                CreateInstitutionValidator.validate(institution)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'name, type'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })
    })
})
