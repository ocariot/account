import { UpdatePasswordValidator } from '../../../src/application/domain/validator/update.password.validator'
import { expect } from 'chai'

describe('Validators: UpdatePassworld', () => {
    it('should return undefined when the validation was successful', () => {
        const result = UpdatePasswordValidator.validate('oldpass', 'newpass')
        expect(result).is.undefined
    })

    context('when does not pass old password or new password', () => {
        it('should throw an error for does not pass old password', () => {
            try {
                UpdatePasswordValidator.validate('', 'newpass')
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Change password validation failed: old_password is required!')
            }
        })

        it('should throw an error for does not pass new password', () => {
            try {
                UpdatePasswordValidator.validate('oldpass', '')
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Change password validation failed: new_password is required!')
            }
        })

        it('should throw an error for does not pass any of required parameters', () => {
            try {
                UpdatePasswordValidator.validate('', '')
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Change password validation failed: old_password, ' +
                    'new_password is required!')
            }
        })
    })
})
