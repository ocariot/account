import { ObjectID } from 'bson'
import { UserType } from '../../../src/application/domain/model/user'
import { Educator } from '../../../src/application/domain/model/educator'
import { assert } from 'chai'
import { Child } from '../../../src/application/domain/model/child'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'

describe('Models: Educator', () => {
    const educatorJSON: any = {
        id: new ObjectID(),
        username: 'myusername',
        password: 'mypassword',
        type: UserType.EDUCATOR,
        children_groups: new Array<Child>()
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a educator model', () => {
                const result = new Educator().fromJSON(educatorJSON)
                assert.property(result, 'id')
                assert.property(result, 'username')
                assert.propertyVal(result, 'username', educatorJSON.username)
                assert.property(result, 'password')
                assert.propertyVal(result, 'password', educatorJSON.password)
                assert.property(result, 'type')
                assert.propertyVal(result, 'type', educatorJSON.type)
                assert.property(result, 'scopes')
                assert.property(result, 'children_groups')
                assert.property(result, 'institution')
            })
        })

        context('when the json is undefined', () => {
            it('should return a educator model with undefined parameters', () => {
                const result = new Educator().fromJSON(undefined)
                result.children_groups = undefined
                assert.property(result, 'id')
                assert.propertyVal(result, 'id', undefined)
                assert.property(result, 'username')
                assert.propertyVal(result, 'username', undefined)
                assert.property(result, 'password')
                assert.propertyVal(result, 'password', undefined)
                assert.property(result, 'type')
                assert.property(result, 'scopes')
                assert.property(result, 'children_groups')
                assert.propertyVal(result, 'children_groups', undefined)
                assert.property(result, 'institution')
                assert.propertyVal(result, 'institution', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should return a educator model', () => {
                const result = new Educator().fromJSON(JSON.stringify(educatorJSON))
                assert.property(result, 'id')
                assert.property(result, 'username')
                assert.propertyVal(result, 'username', educatorJSON.username)
                assert.property(result, 'password')
                assert.propertyVal(result, 'password', educatorJSON.password)
                assert.property(result, 'type')
                assert.propertyVal(result, 'type', educatorJSON.type)
                assert.property(result, 'scopes')
                assert.property(result, 'children_groups')
                assert.property(result, 'institution')
            })
        })
    })

    describe('toJSON()', () => {
        it('should return a JSON from children group model', () => {
            const result = new Educator().toJSON()
            result.children_groups = undefined
            assert.property(result, 'id')
            assert.propertyVal(result, 'id', undefined)
            assert.property(result, 'username')
            assert.propertyVal(result, 'username', undefined)
            assert.property(result, 'type')
            assert.property(result, 'children_groups')
            assert.propertyVal(result, 'children_groups', undefined)
            assert.property(result, 'institution')
            assert.propertyVal(result, 'institution', undefined)
        })
    })

    describe('addChildrenGroup()', () => {
        context('when the children group is undefined', () => {
            it('should set children group as a empty array', () => {
                const result = new Educator().fromJSON(educatorJSON)
                result.children_groups = undefined
                result.addChildrenGroup(new ChildrenGroup())
                assert.property(result, 'children_groups')
                assert.isNotEmpty(result.children_groups)
            })
        })
    })
})
