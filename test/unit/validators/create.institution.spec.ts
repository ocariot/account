import { CreateInstitutionValidator } from '../../../src/application/domain/validator/create.institution.validator'
import { Institution } from '../../../src/application/domain/model/institution'
import { expect } from 'chai'

describe('Validators: Institution', () => {
    it('should return undefined when the validation was successful', () => {
        const institution: Institution = new Institution()
        institution.name = 'institution'
        institution.type = 'test'
        institution.address = 'Av. From Tests'
        institution.longitude = 0
        institution.longitude = 0

        const result = CreateInstitutionValidator.validate(institution)
        expect(result).is.undefined
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
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Institution validation: name is required!')
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
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Institution validation: type is required!')
            }
        })
    })
})
