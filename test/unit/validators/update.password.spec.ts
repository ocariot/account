import { UpdatePasswordValidator } from '../../../src/application/domain/validator/update.password.validator'
import { assert } from 'chai'

describe('Validators: UpdatePassworld', () => {
    it('should return undefined when the validation was successful', () => {
        const result = UpdatePasswordValidator.validate('oldpass', 'newpass')
        assert.equal(result, undefined)
    })

    context('when does not pass old password or new password', () => {
        it('should throw an error for does not pass old password', () => {
            try {
                UpdatePasswordValidator.validate('', 'newpass')
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Change password validation failed: old_password is required!')
            }
        })

        it('should throw an error for does not pass new password', () => {
            try {
                UpdatePasswordValidator.validate('oldpass', '')
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Change password validation failed: new_password is required!')
            }
        })

        it('should throw an error for does not pass any of required parameters', () => {
            try {
                UpdatePasswordValidator.validate('', '')
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Change password validation failed: old_password, ' +
                    'new_password is required!')
            }
        })
    })
})
