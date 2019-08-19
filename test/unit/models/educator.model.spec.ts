import { ObjectID } from 'bson'
import { UserType } from '../../../src/application/domain/model/user'
import { Educator } from '../../../src/application/domain/model/educator'
import { assert } from 'chai'
import { Child } from '../../../src/application/domain/model/child'
import { ChildrenGroupMock } from '../../mocks/children.group.mock'
import { EducatorMock } from '../../mocks/educator.mock'

describe('Models: Educator', () => {
    const educatorJSON: any = {
        id: new ObjectID(),
        username: 'myusername',
        password: 'mypassword',
        type: UserType.EDUCATOR,
        institution: new ObjectID(),
        children_groups: new Array<Child>(),
        scopes: [
            'educators:read',
            'educators:update',
            'childrengroups:create',
            'childrengroups:read',
            'childrengroups:update',
            'childrengroups:delete',
            'institutions:read',
            'institutions:readAll',
            'institutions:update',
            'questionnaires:create',
            'questionnaires:read',
            'questionnaires:update',
            'questionnaires:delete',
            'foodrecord:create',
            'foodrecord:read',
            'foodrecord:update',
            'foodrecord:delete',
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
            'missions:read',
            'gamificationprofile:read'
        ]
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a educator model', () => {
                const result = new Educator().fromJSON(educatorJSON)
                assert.propertyVal(result, 'id', educatorJSON.id)
                assert.propertyVal(result, 'username', educatorJSON.username)
                assert.propertyVal(result, 'password', educatorJSON.password)
                assert.propertyVal(result, 'type', educatorJSON.type)
                assert.deepPropertyVal(result, 'scopes', educatorJSON.scopes)
                assert.deepPropertyVal(result, 'children_groups', educatorJSON.children_groups)
                assert.deepEqual(new ObjectID(result.institution!.id), educatorJSON.institution)
            })
        })

        context('when the json is undefined', () => {
            it('should return a educator model with undefined parameters', () => {
                const result = new Educator().fromJSON(undefined)
                result.children_groups = undefined
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.property(result, 'type')
                assert.property(result, 'scopes')
                assert.propertyVal(result, 'children_groups', undefined)
                assert.propertyVal(result, 'institution', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should return a educator model', () => {
                const result = new Educator().fromJSON(JSON.stringify(educatorJSON))
                assert.propertyVal(result, 'id', educatorJSON.id.toHexString())
                assert.propertyVal(result, 'username', educatorJSON.username)
                assert.propertyVal(result, 'password', educatorJSON.password)
                assert.propertyVal(result, 'type', educatorJSON.type)
                assert.deepPropertyVal(result, 'scopes', educatorJSON.scopes)
                assert.deepPropertyVal(result, 'children_groups', educatorJSON.children_groups)
                assert.property(result, 'institution')
            })
        })
    })

    describe('toJSON()', () => {
        it('should return a JSON from educator model', () => {
            let result = new Educator().fromJSON(educatorJSON)
            result = result.toJSON()
            assert.propertyVal(result, 'id', educatorJSON.id)
            assert.propertyVal(result, 'username', educatorJSON.username)
            assert.propertyVal(result, 'type', educatorJSON.type)
            assert.deepPropertyVal(result, 'children_groups', educatorJSON.children_groups)
            assert.propertyVal(result, 'institution_id', educatorJSON.institution)
        })
    })

    describe('addChildrenGroup()', () => {
        context('when the children group is added into children_group array', () => {
            it('should push children group into the children_groups property of Educator', () => {
                const educator = new Educator().fromJSON(educatorJSON)
                educator.addChildrenGroup(new ChildrenGroupMock())
                // Size check equal to 1 because the educator was created now
                assert.equal(educator.children_groups!.length, 1)
            })
        })

        context('when the children group is undefined', () => {
            it('should set children group as an empty array', () => {
                const result = new Educator().fromJSON(educatorJSON)
                result.children_groups = undefined
                result.addChildrenGroup(new ChildrenGroupMock())
                assert.property(result, 'children_groups')
                assert.isNotEmpty(result.children_groups)
            })
        })
    })

    describe('removeChildrenGroup(childrenGroup: ChildrenGroup)', () => {
        context('when the educator has some children groups registered', () => {
            it('should remove the childrenGroup that was passed by parameter', () => {
                const educator = new EducatorMock()
                educator.removeChildrenGroup(educator.children_groups![1])
                // Size check equal to 1 because 'new EducatorMock()' creates an educator with two children_groups
                assert.equal(educator.children_groups!.length, 1)
            })
        })
    })
})
