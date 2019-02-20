import { UpdateUserValidator } from '../../../src/application/domain/validator/update.user.validator'
import { User } from '../../../src/application/domain/model/user'
import { ObjectID } from 'bson'
import { assert } from 'chai'

describe('Validators: UpdateUser', () => {
    const user: User = new User()
    user.id = `${new ObjectID()}`

    it('should return undefined when the validation was successful', () => {
        user.username = 'newusername'
        const result = UpdateUserValidator.validate(user)
        assert.equal(result, undefined)
    })

    context('when the password parameter was provided', () => {
        it('should throw an error for pass password', () => {
            try {
                user.password = 'newpass'
                UpdateUserValidator.validate(user)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'This parameter could not be updated.')
                assert.equal(err.description, 'A specific route to update user password already exists.' +
                    `Access: PATCH /users/${user.id}/password to update your password.`)
            }
        })
    })
})
