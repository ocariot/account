import { expect } from 'chai'
import { CreateChildValidator } from '../../../src/application/domain/validator/create.child.validator'
import { Child } from '../../../src/application/domain/model/child'
import { Institution } from '../../../src/application/domain/model/institution'
import { ObjectID } from 'bson'

describe('Validators: Child', () => {
    const institution = new Institution()
    institution.id = `${new ObjectID()}`

    it('should return undefined when the validation was successful', () => {

        const child: Child = new Child()
        child.username = 'child'
        child.password = 'secretkey'
        child.age = 11
        child.gender = 'male'
        child.institution = institution

        const result = CreateChildValidator.validate(child)
        expect(result).is.undefined
    })

    context('when the child was incomplete', () => {
        it('should throw an error for does not pass username', () => {
            const child: Child = new Child()
            child.password = 'secretkey'
            child.age = 11
            child.gender = 'male'
            child.institution = institution

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Child validation: username is required!')
            }
        })

        it('should throw an error for does not pass password', () => {
            const child: Child = new Child()
            child.username = 'child'
            child.age = 11
            child.gender = 'male'
            child.institution = institution

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Child validation: password is required!')
            }
        })

        it('should throw an error for does not pass institution', () => {
            const child: Child = new Child()
            child.username = 'child'
            child.password = 'secretkey'
            child.gender = 'male'
            child.age = 11

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Child validation: institution is required!')
            }
        })

        it('should throw an error for pass institution without id', () => {
            const child: Child = new Child()
            child.username = 'child'
            child.password = 'secretkey'
            child.gender = 'male'
            child.age = 11
            child.institution = new Institution()

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Child validation: institution is required!')
            }
        })

        it('should throw an error for does not pass gender', () => {
            const child: Child = new Child()
            child.username = 'child'
            child.password = 'secretkey'
            child.age = 11
            child.institution = institution

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Child validation: gender is required!')
            }
        })

        it('should throw an error for does not pass age', () => {
            const child: Child = new Child()
            child.username = 'child'
            child.password = 'secretkey'
            child.gender = 'male'
            child.institution = institution

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Child validation: age is required!')
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const child: Child = new Child()

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Child validation: username, ' +
                    'password, institution, gender, age is required!')
            }
        })
    })
})
