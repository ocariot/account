import { assert } from 'chai'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { ChildrenGroupMock } from '../../mocks/children.group.mock'
import { ChildrenGroupEntityMapper } from '../../../src/infrastructure/entity/mapper/children.group.entity.mapper'
import { ObjectId } from 'bson'
import { UserMock } from '../../mocks/user.mock'
import { ChildrenGroupEntity } from '../../../src/infrastructure/entity/children.group.entity'

describe('Mappers: ChildrenGroupEntity', () => {
    const children_group: ChildrenGroup = new ChildrenGroupMock()
    children_group.id = new ObjectId().toHexString()
    children_group.user = new UserMock()
    children_group.children![1].id = undefined

    // To test how mapper works with an object without any attributes
    const emptyChildrenGroup: ChildrenGroup = new ChildrenGroup()

    // Create children_group JSON
    const childrenGroupJSON: any = {
        id: '5c9ce480c52b66668b211c94',
        name: 'children group 1',
        school_class: 'Room 01',
        children:
            [
                {
                    id: 'b3e2b04fbd9fa0a8023fb823',
                    type: 'child',
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
                        'environment:read',
                        'missions:read',
                        'gamificationprofile:read',
                        'gamificationprofile:update'
                    ],
                    username: 'child_mock',
                    institution: {
                        id: '273ab3632f16bbd9044753cb',
                        type: 'Institute of Scientific Research',
                        name: 'Name Example',
                        address: '221B Baker Street, St.',
                        latitude: 57.972946525983005,
                        longitude: 15.984903991931109
                    },
                    gender: 'female',
                    age: 7
                },
                {
                    id: '6d9ce5e4206763d2e221e5c7',
                    type: 'child',
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
                        'environment:read',
                        'missions:read',
                        'gamificationprofile:read',
                        'gamificationprofile:update'
                    ],
                    username: 'child_mock',
                    institution: {
                        id: '273ab3632f16bbd9044753cb',
                        type: 'Institute of Scientific Research',
                        name: 'Name Example',
                        address: '221B Baker Street, St.',
                        latitude: 57.972946525983005,
                        longitude: 15.984903991931109
                    },
                    gender: 'male',
                    age: 7
                },
            ]
    }

    // To test how mapper works with an object without any attributes (JSON)
    const emptyChildrenGroupJSON: any = {}

    describe('transform(item: any)', () => {
        context('when the parameter is of type ChildrenGroup', () => {
            it('should normally execute the method, returning a ChildrenGroupEntity as a result of the transformation', () => {
                const result: ChildrenGroupEntity = new ChildrenGroupEntityMapper().transform(children_group)
                assert.propertyVal(result, 'id', children_group.id)
                assert.propertyVal(result, 'name', children_group.name)
                assert.equal(result.children![0], children_group.children![0].id)
                assert.propertyVal(result, 'school_class', children_group.school_class)
                assert.propertyVal(result, 'user_id', children_group.user!.id)
            })
        })

        context('when the parameter is of type ChildrenGroup and does not contain any attributes', () => {
            it('should normally execute the method, returning an empty ChildrenGroupEntity', () => {
                const result: ChildrenGroupEntity = new ChildrenGroupEntityMapper().transform(emptyChildrenGroup)
                assert.isEmpty(result)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning a ChildrenGroup as a result of the transformation', () => {
                const result: ChildrenGroup = new ChildrenGroupEntityMapper().transform(childrenGroupJSON)
                assert.propertyVal(result, 'id', childrenGroupJSON.id)
                assert.propertyVal(result, 'name', childrenGroupJSON.name)
                assert.property(result, 'children')
                assert.propertyVal(result, 'school_class', childrenGroupJSON.school_class)
                assert.propertyVal(result, 'user', childrenGroupJSON.user)
            })
        })

        context('when the parameter is a JSON and does not contain any attributes', () => {
            it('should normally execute the method, returning a ChildrenGroup as a result of the transformation', () => {
                const result: ChildrenGroup = new ChildrenGroupEntityMapper().transform(emptyChildrenGroupJSON)
                assert.propertyVal(result, 'id', emptyChildrenGroupJSON.id)
                assert.propertyVal(result, 'name', emptyChildrenGroupJSON.name)
                assert.propertyVal(result, 'children', emptyChildrenGroupJSON.children)
                assert.propertyVal(result, 'school_class', emptyChildrenGroupJSON.school_class)
                assert.propertyVal(result, 'user', emptyChildrenGroupJSON.user)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning a ChildrenGroup as a result of the transformation', () => {
                const result: ChildrenGroup = new ChildrenGroupEntityMapper().transform(undefined)

                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'name', undefined)
                assert.propertyVal(result, 'children', undefined)
                assert.propertyVal(result, 'school_class', undefined)
                assert.propertyVal(result, 'user', undefined)
            })
        })
    })
})
