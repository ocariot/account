import { Institution } from '../../../src/application/domain/model/institution'
import { expect } from 'chai'
import { ObjectID } from 'bson'
import { Family } from '../../../src/application/domain/model/family'
import { CreateFamilyValidator } from '../../../src/application/domain/validator/create.family.validator'
import { Child } from '../../../src/application/domain/model/child'

describe('Validators: Family', () => {
    const institution = new Institution()
    institution.id = `${new ObjectID()}`

    const child: Child = new Child()
    child.id = `${new ObjectID()}`

    it('should return undefined when the validation was successful', () => {
        const family: Family = new Family()
        family.username = 'family'
        family.password = 'mysecretkey'
        family.children = [child]
        family.institution = institution

        const result = CreateFamilyValidator.validate(family)
        expect(result).is.undefined
    })

    context('when the educator was incomplete', () => {
        it('should throw an error for does not pass username', () => {
            const family: Family = new Family()
            family.password = 'mysecretkey'
            family.children = [child]
            family.institution = institution

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Family validation: username is required!')
            }
        })

        it('should throw an error for does not pass password', () => {
            const family: Family = new Family()
            family.username = 'family'
            family.children = [child]
            family.institution = institution

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Family validation: password is required!')
            }
        })

        it('should throw an error for does not pass institution', () => {
            const family: Family = new Family()
            family.username = 'family'
            family.password = 'mysecretkey'
            family.children = [child]

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Family validation: institution is required!')
            }
        })

        it('should throw an error for pass institution without id', () => {
            const family: Family = new Family()
            family.username = 'family'
            family.password = 'mysecretkey'
            family.children = [child]
            family.institution = new Institution()

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Family validation: institution is required!')
            }
        })

        it('should throw an error for does not pass children collection', () => {
            const family: Family = new Family()
            family.username = 'family'
            family.password = 'mysecretkey'
            family.institution = institution

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Family validation: Collection with children IDs is required!')
            }
        })

        it('should throw an error for pass empty children collection', () => {
            const family: Family = new Family()
            family.username = 'family'
            family.password = 'mysecretkey'
            family.children = []
            family.institution = institution

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Family validation: Collection with children IDs is required!')
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const family: Family = new Family()

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Family validation: username, ' +
                    'password, institution, Collection with children IDs is required!')
            }
        })
    })
})
