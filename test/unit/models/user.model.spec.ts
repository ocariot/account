import { ObjectID } from 'bson'
import { assert } from 'chai'
import { User } from '../../../src/application/domain/model/user'

describe('Models: User', () => {
    const userJSON: any = {
        id: new ObjectID(),
        username: 'ihaveaunknowusername',
        password: 'mysecretkey',
        institution: new ObjectID()
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a user model', () => {
                const result = new User().fromJSON(userJSON)
                assert.propertyVal(result, 'id', userJSON.id)
                assert.propertyVal(result, 'username', userJSON.username)
                assert.propertyVal(result, 'password', userJSON.password)
                assert.deepEqual(new ObjectID(result.institution!.id), userJSON.institution)
            })
        })

        context('when the json is undefined', () => {
            it('should return a user model with undefined parameters', () => {
                const result = new User().fromJSON(undefined)
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'last_login', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return User model', () => {
                const result = new User().fromJSON(JSON.stringify(userJSON))
                assert.propertyVal(result, 'id', userJSON.id.toHexString())
                assert.propertyVal(result, 'username', userJSON.username)
                assert.propertyVal(result, 'password', userJSON.password)
                assert.deepEqual(new ObjectID(result.institution!.id), userJSON.institution)
            })
        })
    })
})
