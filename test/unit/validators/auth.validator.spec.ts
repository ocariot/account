import { AuthValidator } from '../../../src/application/domain/validator/auth.validator'
import { assert } from 'chai'

describe('Validators: Auth', () => {
    context('when the validation was successful', () => {
        it('should return undefined', () => {
            const result = AuthValidator.validate('username', 'password')
            assert.equal(result, undefined)
        })
    })

    context('when doest not pass username or password', () => {
        it('should throw an error for does not pass username', () => {
            try {
                AuthValidator.validate('', 'password')
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Authentication validation: username is required!')
            }
        })

        it('should throw an error for does not pass password', () => {
            try {
                AuthValidator.validate('username', '')
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Authentication validation: password is required!')
            }
        })

        it('should throw an error for does not pass any of required parameters', () => {
            try {
                AuthValidator.validate('', '')
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Authentication validation: username, password is required!')
            }
        })
    })
})
