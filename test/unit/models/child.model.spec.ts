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
                assert.deepEqual(new ObjectID(result.institution!.id), childJSON.institution)
            })
        })

        context('when the json is undefined', () => {
            it('should return a child model only with type', () => {
                const result = new Child().fromJSON(undefined)
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'type', UserType.CHILD)
                assert.propertyVal(result, 'gender', undefined)
                assert.propertyVal(result, 'age', undefined)
                assert.propertyVal(result, 'institution', undefined)
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
            })
        })
    })
})
