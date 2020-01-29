import { UpdatePasswordValidator } from '../../../src/application/domain/validator/update.password.validator'
import { assert } from 'chai'
import { Strings } from '../../../src/utils/strings'

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
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC.replace('{0}', 'old_password'))
            }
        })

        it('should throw an error for does not pass new password', () => {
            try {
                UpdatePasswordValidator.validate('oldpass', undefined!)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC.replace('{0}', 'new_password'))
            }
        })

        it('should throw an error for does not pass any of required parameters', () => {
            try {
                UpdatePasswordValidator.validate(undefined!, undefined!)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                    .replace('{0}', 'old_password, new_password'))
            }
        })
    })
})
