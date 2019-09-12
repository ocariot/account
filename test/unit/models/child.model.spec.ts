import { ObjectID } from 'bson'
import { UserType } from '../../../src/application/domain/model/user'
import { Child } from '../../../src/application/domain/model/child'
import { assert } from 'chai'

describe('Models: Child', () => {
    const childJSON: any = {
        username: 'ihaveauniqueusername',
        password: 'mysecretkey',
        type: UserType.CHILD,
        gender: 'male',
        age: 10,
        institution: new ObjectID(),
        scopes: [
            'children:read',
            'institutions:read',
            'questionnaires:create',
            'questionnaires:read',
            'foodrecord:create',
            'foodrecord:read',
            'physicalactivities:create',
            'physicalactivities:read',
            'sleep:create',
            'sleep:read',
            'measurements:create',
            'measurements:read',
            'environment:read',
            'missions:read',
            'gamificationprofile:read',
            'gamificationprofile:update',
            'external:sync'
        ],
        last_login: new Date(),
        last_sync: new Date()
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a child model', () => {
                const result = new Child().fromJSON(childJSON)

                assert.propertyVal(result, 'id', childJSON.id)
                assert.propertyVal(result, 'username', childJSON.username)
                assert.propertyVal(result, 'password', childJSON.password)
                assert.propertyVal(result, 'type', childJSON.type)
                assert.propertyVal(result, 'gender', childJSON.gender)
                assert.propertyVal(result, 'age', childJSON.age)
                assert.deepPropertyVal(result, 'scopes', childJSON.scopes)
                assert.deepEqual(new ObjectID(result.institution!.id), childJSON.institution)
                assert.propertyVal(result, 'last_login', childJSON.last_login)
                assert.propertyVal(result, 'last_sync', childJSON.last_sync)
            })
        })

        context('when the json is undefined', () => {
            it('should return a child model only with type and scope', () => {
                const result = new Child().fromJSON(undefined)
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'type', UserType.CHILD)
                assert.propertyVal(result, 'gender', undefined)
                assert.propertyVal(result, 'age', undefined)
                assert.deepPropertyVal(result, 'scopes', childJSON.scopes)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'last_login', undefined)
                assert.propertyVal(result, 'last_sync', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Child model', () => {
                const result = new Child().fromJSON(JSON.stringify(childJSON))
                assert.propertyVal(result, 'id', childJSON.id)
                assert.propertyVal(result, 'username', childJSON.username)
                assert.propertyVal(result, 'password', childJSON.password)
                assert.propertyVal(result, 'type', childJSON.type)
                assert.propertyVal(result, 'gender', childJSON.gender)
                assert.propertyVal(result, 'age', childJSON.age)
                assert.deepEqual(new ObjectID(result.institution!.id), childJSON.institution)
                assert.deepPropertyVal(result, 'scopes', childJSON.scopes)
                assert.deepPropertyVal(result, 'last_login', childJSON.last_login)
                assert.deepPropertyVal(result, 'last_sync', childJSON.last_sync)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Child model is correct', () => {
            it('should return a JSON from Child model', () => {
                let result = new Child().fromJSON(childJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', childJSON.id)
                assert.propertyVal(result, 'username', childJSON.username)
                assert.propertyVal(result, 'type', childJSON.type)
                assert.propertyVal(result, 'gender', childJSON.gender)
                assert.propertyVal(result, 'age', childJSON.age)
                assert.propertyVal(result, 'institution_id', childJSON.institution)
                assert.propertyVal(result, 'last_login', childJSON.last_login)
                assert.propertyVal(result, 'last_sync', childJSON.last_sync)
            })
        })
    })
})
