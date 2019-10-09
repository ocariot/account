import { UpdateUserValidator } from '../../../src/application/domain/validator/update.user.validator'
import { User } from '../../../src/application/domain/model/user'
import { ObjectID } from 'bson'
import { assert } from 'chai'
import { InstitutionMock } from '../../mocks/institution.mock'

describe('Validators: UpdateUser', () => {
    const user: User = new User()
    user.id = `${new ObjectID()}`
    user.institution = new InstitutionMock()

    context('when the validation was successful', () => {
        it('should return undefined', () => {
            user.username = 'newusername'
            const result = UpdateUserValidator.validate(user)
            assert.equal(result, undefined)
        })
    })

    context('when the validation was successful and the user is empty', () => {
        it('should return undefined', () => {
            const result = UpdateUserValidator.validate(new User())
            assert.equal(result, undefined)
        })
    })

    context('when the id parameter is invalid', () => {
        it('should throw a ValidationException', () => {
            try {
                user.id = '123'
                UpdateUserValidator.validate(user)
            } catch (err) {
                assert.equal(err.message, 'USER_ID_INVALID')
            }
        })
    })

    context('when the institution id parameter is invalid', () => {
        it('should throw a ValidationException', () => {
            try {
                user.institution!.id = '123'
                UpdateUserValidator.validate(user)
            } catch (err) {
                assert.equal(err.message, 'USER_ID_INVALID')
            }
        })
    })

    context('when the password parameter was provided', () => {
        it('should throw a ValidationException', () => {
            try {
                user.id = `${new ObjectID()}`
                user.institution!.id = `${new ObjectID()}`
                user.password = 'newpass'
                UpdateUserValidator.validate(user)
            } catch (err) {
                assert.equal(err.message, 'This parameter could not be updated.')
                assert.equal(err.description, 'A specific route to update user password already exists.' +
                    `Access: PATCH /users/${user.id}/password to update your password.`)
            }
        })
    })
})
