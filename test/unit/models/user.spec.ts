import { ObjectID } from 'bson'
import { assert } from 'chai'
import { User } from '../../../src/application/domain/model/user'

describe('Models: User', () => {
    const userJSON: any = {
        id: new ObjectID(),
        username: 'ihaveaunknowusername',
        password: 'mysecretkey',
        institution: new ObjectID(),
        scope: ['users:read']
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a user model', () => {
                const result = new User().fromJSON(userJSON)
                assert.property(result, 'id')
                assert.property(result, 'username')
                assert.propertyVal(result, 'username', userJSON.username)
                assert.property(result, 'password')
                assert.propertyVal(result, 'password', userJSON.password)
                assert.property(result, 'institution')
            })
        })

        context('when the json is undefined', () => {
            it('should return a user model with undefined parameters', () => {
                const result = new User().fromJSON(undefined)
                assert.property(result, 'id')
                assert.propertyVal(result, 'id', undefined)
                assert.property(result, 'username')
                assert.propertyVal(result, 'username', undefined)
                assert.property(result, 'password')
                assert.propertyVal(result, 'password', undefined)
                assert.property(result, 'institution')
            })
        })
    })

    describe('addScope()', () => {
        it('should add scope in scope array', () => {
            const result = new User().fromJSON(userJSON)
            result.addScope('users:write')
            assert.isArray(result.scopes)
            assert.isNotEmpty(result.scopes)
        })

        context('when user scope array is undefined', () => {
            it('should set scope as empty array', () => {
                const result = new User()
                result.addScope('users:read')
                assert.isArray(result.scopes)
                assert.isNotEmpty(result.scopes)
            })
        })

        context('when scope is null', () => {
            it('should not add scope', () => {
                const result = new User().fromJSON(userJSON)
                result.addScope(null!)
                assert.isArray(result.scopes)
                assert.isNotEmpty(result.scopes)
            })
        })
    })
})
