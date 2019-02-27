import { ObjectID } from 'bson'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { assert } from 'chai'
import { Child } from '../../../src/application/domain/model/child'

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
                assert.property(result, 'id')
                assert.property(result, 'name')
                assert.propertyVal(result, 'name', childrenGroupJSON.name)
                assert.property(result, 'school_class')
                assert.propertyVal(result, 'school_class', childrenGroupJSON.school_class)
                assert.property(result, 'children')
            })
        })

        context('when the json is undefined', () => {
            it('should return a children group model with undefined parameters', () => {
                const result = new ChildrenGroup().fromJSON(undefined)
                assert.property(result, 'id')
                assert.propertyVal(result, 'id', undefined)
                assert.property(result, 'name')
                assert.propertyVal(result, 'name', undefined)
                assert.property(result, 'school_class')
                assert.propertyVal(result, 'school_class', undefined)
                assert.property(result, 'children')
                assert.propertyVal(result, 'children', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should return a children group model after convert string to json', () => {
                const result = new ChildrenGroup().fromJSON(JSON.stringify(childrenGroupJSON))
                assert.property(result, 'id')
                assert.property(result, 'name')
                assert.propertyVal(result, 'name', childrenGroupJSON.name)
                assert.property(result, 'school_class')
                assert.propertyVal(result, 'school_class', childrenGroupJSON.school_class)
                assert.property(result, 'children')
            })
        })

        context('when the parameter is a id string', () => {
            it('should return a children group model with undefined parameters', () => {
                const result = new ChildrenGroup().fromJSON(`${new ObjectID()}`)
                assert.property(result, 'id')
                assert.property(result, 'name')
                assert.propertyVal(result, 'name', undefined)
                assert.property(result, 'school_class')
                assert.propertyVal(result, 'school_class', undefined)
                assert.property(result, 'children')
                assert.propertyVal(result, 'children', undefined)
            })
        })
    })

    describe('addChild()', () => {
        context('when the child is added into children array', () => {
            it('should return a children group model with a child in children array', () => {
                const childrenGroup = new ChildrenGroup().fromJSON(childrenGroupJSON)
                childrenGroup.addChild(new Child())
                assert.equal(childrenGroup.children!.length, 1)
            })
        })

        context('when the child is undefined', () => {
            it('should return the children group model with children array as undefined', () => {
                const childrenGroup = new ChildrenGroup().fromJSON(undefined)
                childrenGroup.children = undefined
                childrenGroup.addChild(new Child())
                assert.property(childrenGroup, 'children')
                assert.isNotEmpty(childrenGroup.children)
            })
        })
    })

    describe('toJSON()', () => {
        it('should return a JSON from children group model', () => {
            const result = new ChildrenGroup().toJSON()
            assert.property(result, 'id')
            assert.propertyVal(result, 'id', undefined)
            assert.property(result, 'name')
            assert.propertyVal(result, 'name', undefined)
            assert.property(result, 'school_class')
            assert.propertyVal(result, 'school_class', undefined)
            assert.property(result, 'children')
            assert.propertyVal(result, 'children', undefined)
        })
    })
})
