import { ObjectID } from 'bson'
import { UserType } from '../../../src/application/domain/model/user'
import { Child } from '../../../src/application/domain/model/child'
import { Family } from '../../../src/application/domain/model/family'
import { assert } from 'chai'

describe('Models: Family', () => {
    const familyJSON: any = {
        id: new ObjectID(),
        username: 'myusername',
        password: 'mypassword',
        type: UserType.FAMILY,
        children: new Array<Child>()
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a family model', () => {
                const result = new Family().fromJSON(familyJSON)
                assert.property(result, 'id')
                assert.property(result, 'username')
                assert.propertyVal(result, 'username', familyJSON.username)
                assert.property(result, 'password')
                assert.propertyVal(result, 'password', familyJSON.password)
                assert.property(result, 'type')
                assert.propertyVal(result, 'type', familyJSON.type)
                assert.property(result, 'scopes')
                assert.property(result, 'children')
                assert.property(result, 'institution')
            })
        })

        context('when the json is undefined', () => {
            it('should return a family model with undefined parameters', () => {
                const result = new Family().fromJSON(undefined)
                result.children = undefined
                assert.property(result, 'id')
                assert.propertyVal(result, 'id', undefined)
                assert.property(result, 'username')
                assert.propertyVal(result, 'username', undefined)
                assert.property(result, 'password')
                assert.propertyVal(result, 'password', undefined)
                assert.property(result, 'type')
                assert.property(result, 'scopes')
                assert.property(result, 'children')
                assert.propertyVal(result, 'children', undefined)
                assert.property(result, 'institution')
                assert.propertyVal(result, 'institution', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should return a family model', () => {
                const result = new Family().fromJSON(JSON.stringify(familyJSON))
                assert.property(result, 'id')
                assert.property(result, 'username')
                assert.propertyVal(result, 'username', familyJSON.username)
                assert.property(result, 'password')
                assert.propertyVal(result, 'password', familyJSON.password)
                assert.property(result, 'type')
                assert.propertyVal(result, 'type', familyJSON.type)
                assert.property(result, 'scopes')
                assert.property(result, 'children')
                assert.property(result, 'institution')
            })
        })
    })

    describe('toJSON()', () => {
        it('should return a JSON from children group model', () => {
            const result = new Family().toJSON()
            result.children = undefined
            assert.property(result, 'id')
            assert.propertyVal(result, 'id', undefined)
            assert.property(result, 'username')
            assert.propertyVal(result, 'username', undefined)
            assert.property(result, 'type')
            assert.property(result, 'children')
            assert.propertyVal(result, 'children', undefined)
            assert.property(result, 'institution')
            assert.propertyVal(result, 'institution', undefined)
        })
    })

    describe('addChild()', () => {
        context('when the children array is undefined', () => {
            it('should set the children array as empty array', () => {
                const result = new Family().fromJSON(familyJSON)
                result.children = undefined
                result.addChild(new Child)
                assert.property(result, 'children')
                assert.isNotEmpty(result.children)
            })
        })
    })
})
