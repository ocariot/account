import { AuthValidator } from '../../../src/application/domain/validator/auth.validator'
import { expect } from 'chai'

describe('Validators: Auth', () => {
    it('should return undefined when the validation was successful', () => {
        const result = AuthValidator.validate('username', 'password')
        expect(result).is.undefined
    })

    context('when doest not pass username or password', () => {
        it('should throw an error for does not pass username', () => {
            try {
                AuthValidator.validate('', 'password')
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Authentication validation: username is required!')
            }
        })

        it('should throw an error for does not pass password', () => {
            try {
                AuthValidator.validate('username', '')
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Authentication validation: password is required!')
            }
        })

        it('should throw an error for does not pass any of required parameters', () => {
            try {
                AuthValidator.validate('', '')
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Authentication validation: username, password is required!')
            }
        })
    })
})
