import { ObjectID } from 'bson'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { assert } from 'chai'
import { ChildMock } from '../../mocks/child.mock'

describe('Models: ChildrenGroup', () => {
    const childrenGroupJSON: any = {
        id: new ObjectID(),
        name: 'A Children Group',
        school_class: '4th grade',
        children: []
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a children group model', () => {
                const result = new ChildrenGroup().fromJSON(childrenGroupJSON)
                assert.propertyVal(result, 'id', childrenGroupJSON.id)
                assert.propertyVal(result, 'name', childrenGroupJSON.name)
                assert.deepPropertyVal(result, 'children', childrenGroupJSON.children)
                assert.propertyVal(result, 'school_class', childrenGroupJSON.school_class)
                assert.property(result, 'user')
            })
        })

        context('when the json is undefined', () => {
            it('should return a children group model with undefined parameters', () => {
                const result = new ChildrenGroup().fromJSON(undefined)
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'name', undefined)
                assert.propertyVal(result, 'school_class', undefined)
                assert.propertyVal(result, 'children', undefined)
                assert.propertyVal(result, 'user', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should return a children group model after convert string to json', () => {
                const result = new ChildrenGroup().fromJSON(JSON.stringify(childrenGroupJSON))
                assert.propertyVal(result, 'id', childrenGroupJSON.id.toHexString())
                assert.propertyVal(result, 'name', childrenGroupJSON.name)
                assert.propertyVal(result, 'school_class', childrenGroupJSON.school_class)
                assert.deepPropertyVal(result, 'children', childrenGroupJSON.children)
                assert.property(result, 'user')
            })
        })

        context('when the parameter is a id string', () => {
            it('should return a children group model with undefined parameters', () => {
                const result = new ChildrenGroup().fromJSON(`${new ObjectID()}`)
                assert.property(result, 'id')
                assert.propertyVal(result, 'name', undefined)
                assert.propertyVal(result, 'school_class', undefined)
                assert.propertyVal(result, 'children', undefined)
            })
        })
    })

    describe('addChild()', () => {
        context('when the child is added into children array', () => {
            it('should return a children group model with a child in children array', () => {
                const childrenGroup = new ChildrenGroup().fromJSON(childrenGroupJSON)
                childrenGroup.addChild(new ChildMock())
                assert.equal(childrenGroup.children!.length, 1)
            })
        })

        context('when the child is undefined', () => {
            it('should return the children group model with children array as undefined', () => {
                const childrenGroup = new ChildrenGroup().fromJSON(childrenGroupJSON)
                childrenGroup.children = undefined
                childrenGroup.addChild(new ChildMock())
                assert.property(childrenGroup, 'children')
                assert.isNotEmpty(childrenGroup.children)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the children group is complete', () => {
            it('should return a JSON from children group model', () => {
                let result = new ChildrenGroup().fromJSON(childrenGroupJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', childrenGroupJSON.id)
                assert.propertyVal(result, 'name', childrenGroupJSON.name)
                assert.deepPropertyVal(result, 'children', childrenGroupJSON.children)
                assert.propertyVal(result, 'school_class', childrenGroupJSON.school_class)
            })
        })

        context('when the children group is incomplete', () => {
            it('should return a JSON from children group model', () => {
                childrenGroupJSON.children = undefined
                let result = new ChildrenGroup().fromJSON(childrenGroupJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', childrenGroupJSON.id)
                assert.propertyVal(result, 'name', childrenGroupJSON.name)
                assert.deepPropertyVal(result, 'children', childrenGroupJSON.children)
                assert.propertyVal(result, 'school_class', childrenGroupJSON.school_class)
            })
        })
    })
})
