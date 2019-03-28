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
        institution: new ObjectID()
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a child model', () => {
                const result = new Child().fromJSON(childJSON)

                assert.property(result, 'id')
                assert.property(result, 'username')
                assert.propertyVal(result, 'username', childJSON.username)
                assert.property(result, 'password')
                assert.propertyVal(result, 'password', childJSON.password)
                assert.property(result, 'type')
                assert.propertyVal(result, 'type', childJSON.type)
                assert.property(result, 'gender')
                assert.propertyVal(result, 'gender', childJSON.gender)
                assert.property(result, 'age')
                assert.propertyVal(result, 'age', childJSON.age)
                assert.property(result, 'institution')
                assert.property(result, 'scopes')
                assert.property(result, 'institution')
            })
        })

        context('when the json is undefined', () => {
            it('should return a child model only with type and scope', () => {
                const result = new Child().fromJSON(undefined)
                assert.property(result, 'id')
                assert.propertyVal(result, 'id', undefined)
                assert.property(result, 'username')
                assert.propertyVal(result, 'username', undefined)
                assert.property(result, 'password')
                assert.propertyVal(result, 'password', undefined)
                assert.property(result, 'type')
                assert.propertyVal(result, 'type', UserType.CHILD)
                assert.property(result, 'gender')
                assert.propertyVal(result, 'gender', undefined)
                assert.property(result, 'age')
                assert.propertyVal(result, 'age', undefined)
                assert.property(result, 'scopes')
                assert.property(result, 'institution')
            })
        })
    })
})
