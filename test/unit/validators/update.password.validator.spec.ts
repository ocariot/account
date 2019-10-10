import { UpdatePasswordValidator } from '../../../src/application/domain/validator/update.password.validator'
import { assert } from 'chai'

describe('Validators: UpdatePassword', () => {
    context('when the validation was successful', () => {
        it('should return undefined', () => {
            const result = UpdatePasswordValidator.validate('oldpass', 'newpass')
            assert.equal(result, undefined)
        })
    })

    context('when does not pass old password or new password', () => {
        it('should throw an error for does not pass old password', () => {
            try {
                UpdatePasswordValidator.validate(undefined!, 'newpass')
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Change password validation failed: old_password is required!')
            }
        })

        it('should throw an error for does not pass new password', () => {
            try {
                UpdatePasswordValidator.validate('oldpass', undefined!)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Change password validation failed: new_password is required!')
            }
        })

        it('should throw an error for does not pass any of required parameters', () => {
            try {
                UpdatePasswordValidator.validate(undefined!, undefined!)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Change password validation failed: old_password, ' +
                    'new_password is required!')
            }
        })
    })
})
