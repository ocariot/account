import { CreateInstitutionValidator } from '../../../src/application/domain/validator/create.institution.validator'
import { Institution } from '../../../src/application/domain/model/institution'
import { assert } from 'chai'
import { InstitutionMock } from '../../mocks/institution.mock'

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
            institution.name = ''

            try {
                CreateInstitutionValidator.validate(institution)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Institution validation: name is required!')
            }
        })

        it('should throw an error for does not pass type', () => {
            institution.name = 'institution'
            institution.type = ''

            try {
                CreateInstitutionValidator.validate(institution)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Institution validation: type is required!')
            }
        })

        it('should throw an error for does not pass any of required parameters', () => {
            institution.name = ''

            try {
                CreateInstitutionValidator.validate(institution)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Institution validation: name, type is required!')
            }
        })
    })
})
