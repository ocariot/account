import { ObjectID } from 'bson'
import { assert } from 'chai'
import { User } from '../../../src/application/domain/model/user'

describe('Models: User', () => {
    const userJSON: any = {
        id: new ObjectID(),
        username: 'ihaveaunknowusername',
        password: 'mysecretkey',
        institution: new ObjectID(),
        scope: ['users:read'],
        last_login: new Date()
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a user model', () => {
                const result = new User().fromJSON(userJSON)
                assert.propertyVal(result, 'id', userJSON.id)
                assert.propertyVal(result, 'username', userJSON.username)
                assert.propertyVal(result, 'password', userJSON.password)
                assert.deepEqual(new ObjectID(result.institution!.id), userJSON.institution)
                assert.deepPropertyVal(result, 'scopes', userJSON.scope)
                assert.propertyVal(result, 'last_login', userJSON.last_login)
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
                assert.deepPropertyVal(result, 'scopes', userJSON.scope)
                assert.deepPropertyVal(result, 'last_login', userJSON.last_login)
            })
        })
    })

    describe('addScope(scope: string)', () => {
        context('when the user scope array already exists', () => {
            it('should add scope in scope array', () => {
                const result = new User().fromJSON(userJSON)
                result.addScope('users:write')
                assert.isArray(result.scopes)
                assert.isNotEmpty(result.scopes)
            })
        })

        context('when user scope array is undefined', () => {
            it('should set scope as empty array', () => {
                const result = new User()
                result.addScope('users:read')
                assert.isArray(result.scopes)
                assert.isNotEmpty(result.scopes)
            })
        })

        context('when scope is undefined', () => {
            it('should not add scope', () => {
                const result = new User().fromJSON(userJSON)
                result.addScope(undefined!)
                assert.isArray(result.scopes)
                assert.isNotEmpty(result.scopes)
            })
        })
    })

    describe('removeScope(scope: string)', () => {
        context('when the user scope array contains the scope passed by parameter', () => {
            it('should remove the scope', () => {
                const result = new User().fromJSON(userJSON)
                result.removeScope(result.scopes[0])
                assert.isArray(result.scopes)
                // Size check equal to 1 because the user scope array was with 2 elements
                assert.equal(result.scopes.length, 1)
            })
        })

        context('when the parameter is undefined', () => {
            it('should not do anything', () => {
                const result = new User().fromJSON(userJSON)
                result.removeScope(undefined!)
                assert.isArray(result.scopes)
                assert.isNotEmpty(result.scopes)
            })
        })
    })
})
