import { ObjectID } from 'bson'
import { UserType } from '../../../src/application/domain/model/user'
import { Child } from '../../../src/application/domain/model/child'
import { Family } from '../../../src/application/domain/model/family'
import { assert } from 'chai'
import { ChildMock } from '../../mocks/child.mock'

describe('Models: Family', () => {
    const familyJSON: any = {
        id: new ObjectID(),
        username: 'myusername',
        password: 'mypassword',
        type: UserType.FAMILY,
        institution: new ObjectID(),
        children: new Array<Child>(),
        scopes: [
            'children:read',
            'families:read',
            'families:update',
            'institutions:read',
            'physicalactivities:create',
            'physicalactivities:read',
            'physicalactivities:update',
            'physicalactivities:delete',
            'sleep:create',
            'sleep:read',
            'sleep:update',
            'sleep:delete',
            'measurements:create',
            'measurements:read',
            'measurements:delete',
            'environment:read',
            'socioquest:create',
            'socioquest:read',
            'socioquest:update',
            'healthquest:create',
            'healthquest:read',
            'healthquest:update',
            'parentphyquest:create',
            'parentphyquest:read',
            'parentphyquest:update',
            'childrenphyquest:read',
            'habitsquest:create',
            'habitsquest:read',
            'habitsquest:update',
            'foodhabitsquest:create',
            'foodhabitsquest:read',
            'foodhabitsquest:update',
            'perceptionquest:create',
            'perceptionquest:read',
            'perceptionquest:update',
            'foodtracking:create',
            'foodtracking:read',
            'foodtracking:update',
            'foodtracking:delete',
            'missions:create',
            'missions:read',
            'missions:update',
            'gamificationprofile:create',
            'gamificationprofile:read',
            'gamificationprofile:update',
            'external:sync',
            'notifications:create'
        ]
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a family model', () => {
                const result = new Family().fromJSON(familyJSON)
                assert.propertyVal(result, 'id', familyJSON.id)
                assert.propertyVal(result, 'username', familyJSON.username)
                assert.propertyVal(result, 'password', familyJSON.password)
                assert.propertyVal(result, 'type', familyJSON.type)
                assert.deepPropertyVal(result, 'scopes', familyJSON.scopes)
                assert.deepPropertyVal(result, 'children', familyJSON.children)
                assert.deepEqual(new ObjectID(result.institution!.id), familyJSON.institution)
            })
        })

        context('when the json is undefined', () => {
            it('should return a family model with undefined parameters', () => {
                const result = new Family().fromJSON(undefined)
                result.children = undefined
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.property(result, 'type')
                assert.property(result, 'scopes')
                assert.propertyVal(result, 'children', undefined)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'last_login', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should return a family model', () => {
                const result = new Family().fromJSON(JSON.stringify(familyJSON))
                assert.propertyVal(result, 'id', familyJSON.id.toHexString())
                assert.propertyVal(result, 'username', familyJSON.username)
                assert.propertyVal(result, 'password', familyJSON.password)
                assert.propertyVal(result, 'type', familyJSON.type)
                assert.deepPropertyVal(result, 'scopes', familyJSON.scopes)
                assert.deepPropertyVal(result, 'children', familyJSON.children)
                assert.deepEqual(new ObjectID(result.institution!.id), familyJSON.institution)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the children group is complete', () => {
            it('should return a JSON from family model', () => {
                let result = new Family().fromJSON(familyJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', familyJSON.id)
                assert.propertyVal(result, 'username', familyJSON.username)
                assert.propertyVal(result, 'type', familyJSON.type)
                assert.deepPropertyVal(result, 'children', familyJSON.children)
                assert.propertyVal(result, 'institution_id', familyJSON.institution)
            })
        })

        context('when the children group is incomplete', () => {
            it('should return a JSON from family model', () => {
                familyJSON.children = undefined
                let result = new Family().fromJSON(familyJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', familyJSON.id)
                assert.propertyVal(result, 'username', familyJSON.username)
                assert.propertyVal(result, 'type', familyJSON.type)
                assert.deepPropertyVal(result, 'children', familyJSON.children)
                assert.propertyVal(result, 'institution_id', familyJSON.institution)
            })
        })
    })

    describe('addChild()', () => {
        context('when the child is added into children array', () => {
            it('should push child into the children property of Family', () => {
                const family = new Family().fromJSON(familyJSON)
                family.addChild(new ChildMock())
                assert.equal(family.children!.length, 1)
            })
        })

        context('when the child is undefined', () => {
            it('should set children as an empty array', () => {
                const family = new Family().fromJSON(familyJSON)
                family.children = undefined
                family.addChild(new ChildMock())
                assert.property(family, 'children')
                assert.isNotEmpty(family.children)
            })
        })
    })
})
