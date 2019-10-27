import { AuthValidator } from '../../../src/application/domain/validator/auth.validator'
import { assert } from 'chai'
import { Strings } from '../../../src/utils/strings'

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
                AuthValidator.validate(undefined!, 'password')
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'username'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass password', () => {
            try {
                AuthValidator.validate('username', undefined!)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'password'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass any of required parameters', () => {
            try {
                AuthValidator.validate(undefined!, undefined!)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'username, password'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })
    })
})
