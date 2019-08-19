import { assert } from 'chai'
import { EducatorEntityMapper } from '../../../src/infrastructure/entity/mapper/educator.entity.mapper'
import { EducatorMock } from '../../mocks/educator.mock'
import { Educator } from '../../../src/application/domain/model/educator'

describe('Mappers: EducatorEntity', () => {
    const educator: Educator = new EducatorMock()
    educator.password = 'educator_password'

    // Create educator JSON
    const educatorJSON: any = {
        id: 'bf18fce50ab596a9f379e188',
        type: 'educator',
        scopes:
            [
                'educators:read',
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
                'environment:read',
                'missions:read',
                'gamificationprofile:read'
            ],
        username: 'educator_mock',
        password: 'educator_password',
        institution:
            {
                id: '9e97b425c3e7db930e9dd04c',
                type: 'Institute of Scientific Research',
                name: 'Name Example',
                address: '221B Baker Street, St.',
                latitude: 19.451064916085738,
                longitude: 115.35107223303844
            },
        children_groups:
            [
                {
                    id: undefined,
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
            ]
    }

    describe('transform(item: any)', () => {
        context('when the parameter is of type Educator', () => {
            it('should normally execute the method, returning an EducatorEntity as a result of the transformation', () => {
                const result = new EducatorEntityMapper().transform(educator)
                assert.propertyVal(result, 'id', educator.id)
                assert.propertyVal(result, 'username', educator.username)
                assert.propertyVal(result, 'password', educator.password)
                assert.propertyVal(result, 'type', educator.type)
                assert.propertyVal(result, 'scopes', educator.scopes)
                assert.propertyVal(result, 'institution', educator.institution!.id)
                assert.property(result, 'children_groups')
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning an Educator as a result of the transformation', () => {
                const result = new EducatorEntityMapper().transform(educatorJSON)
                assert.propertyVal(result, 'id', educatorJSON.id)
                assert.propertyVal(result, 'username', educatorJSON.username)
                assert.propertyVal(result, 'password', educatorJSON.password)
                assert.propertyVal(result, 'type', educatorJSON.type)
                assert.deepPropertyVal(result, 'scopes', educatorJSON.scopes)
                assert.property(result, 'institution')
                assert.property(result, 'children_groups')
            })
        })

        context('when the parameter is a JSON without an institution', () => {
            it('should not normally execute the method, returning an Educator as a result of the transformation', () => {
                educatorJSON.institution = null
                const result = new EducatorEntityMapper().transform(educatorJSON)
                assert.propertyVal(result, 'id', educatorJSON.id)
                assert.propertyVal(result, 'username', educatorJSON.username)
                assert.propertyVal(result, 'password', educatorJSON.password)
                assert.propertyVal(result, 'type', educatorJSON.type)
                assert.deepPropertyVal(result, 'scopes', educatorJSON.scopes)
                assert.isUndefined(result.institution)
                assert.property(result, 'children_groups')
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning an Educator as a result of the transformation', () => {
                const result = new EducatorEntityMapper().transform(undefined)

                assert.isObject(result)
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'children_groups', undefined)
            })
        })
    })
})
