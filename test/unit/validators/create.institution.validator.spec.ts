import { CreateInstitutionValidator } from '../../../src/application/domain/validator/create.institution.validator'
import { Institution } from '../../../src/application/domain/model/institution'
import { assert } from 'chai'

describe('Validators: Institution', () => {
    it('should return undefined when the validation was successful', () => {
        const institution: Institution = new Institution()
        institution.name = 'institution'
        institution.type = 'test'
        institution.address = 'Av. From Tests'
        institution.longitude = 0
        institution.longitude = 0

        const result = CreateInstitutionValidator.validate(institution)
        assert.equal(result, undefined)
    })

    context('when the institution was incomplete', () => {
        it('should throw an error for does not pass name', () => {
            const institution: Institution = new Institution()
            institution.type = 'test'
            institution.address = 'Av. From Tests'
            institution.longitude = 0
            institution.longitude = 0

            try {
                CreateInstitutionValidator.validate(institution)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Institution validation: name is required!')
            }
        })

        it('should throw an error for does not pass type', () => {
            const institution: Institution = new Institution()
            institution.name = 'institution'
            institution.address = 'Av. From Tests'
            institution.longitude = 0
            institution.longitude = 0

            try {
                CreateInstitutionValidator.validate(institution)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Institution validation: type is required!')
            }
        })
    })
})
