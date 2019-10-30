import { assert } from 'chai'
import { EducatorEntityMapper } from '../../../src/infrastructure/entity/mapper/educator.entity.mapper'
import { EducatorMock } from '../../mocks/educator.mock'
import { Educator } from '../../../src/application/domain/model/educator'
import { EducatorEntity } from '../../../src/infrastructure/entity/educator.entity'
import { UserType } from '../../../src/application/domain/model/user'

describe('Mappers: EducatorEntity', () => {
    const educator: Educator = new EducatorMock()
    educator.password = 'educator_password'
    educator.children_groups![1].id = undefined

    // To test how mapper works with an object without any attributes
    const emptyEducator: Educator = new Educator()
    emptyEducator.type = undefined
    emptyEducator.scopes = undefined!

    // Create educator JSON
    const educatorJSON: any = {
        id: 'bf18fce50ab596a9f379e188',
        type: 'educator',
        scopes:
            [
                'children:read',
                'children:readAll',
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
                'gamificationprofile:read',
                'external:sync'
            ],
        username: 'educator_mock',
        password: 'educator_password',
        institution: '9e97b425c3e7db930e9dd04c',
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
                                institution: '273ab3632f16bbd9044753cb',
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
                                institution: '273ab3632f16bbd9044753cb',
                                gender: 'male',
                                age: 7
                            },
                        ]
                }
            ]
    }

    // To test how mapper works with an object without any attributes (JSON)
    const emptyEducatorJSON: any = {}

    describe('transform(item: any)', () => {
        context('when the parameter is of type Educator', () => {
            it('should normally execute the method, returning an EducatorEntity as a result of the transformation', () => {
                const result: EducatorEntity = new EducatorEntityMapper().transform(educator)
                assert.propertyVal(result, 'id', educator.id)
                assert.propertyVal(result, 'username', educator.username)
                assert.propertyVal(result, 'password', educator.password)
                assert.propertyVal(result, 'type', educator.type)
                assert.propertyVal(result, 'scopes', educator.scopes)
                assert.propertyVal(result, 'institution', educator.institution!.id)
                assert.property(result, 'children_groups')
            })
        })

        context('when the parameter is of type Educator and does not contain any attributes', () => {
            it('should normally execute the method, returning an empty EducatorEntity', () => {
                const result: EducatorEntity = new EducatorEntityMapper().transform(emptyEducator)
                assert.isEmpty(result)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning an Educator as a result of the transformation', () => {
                const result: Educator = new EducatorEntityMapper().transform(educatorJSON)
                assert.propertyVal(result, 'id', educatorJSON.id)
                assert.propertyVal(result, 'username', educatorJSON.username)
                assert.propertyVal(result, 'password', educatorJSON.password)
                assert.propertyVal(result, 'type', educatorJSON.type)
                assert.deepPropertyVal(result, 'scopes', educatorJSON.scopes)
                assert.equal(result.institution!.id, educatorJSON.institution)
                assert.property(result, 'children_groups')
            })
        })

        context('when the parameter is a JSON without an institution', () => {
            it('should not normally execute the method, returning an Educator as a result of the transformation', () => {
                educatorJSON.institution = null
                const result: Educator = new EducatorEntityMapper().transform(educatorJSON)
                assert.propertyVal(result, 'id', educatorJSON.id)
                assert.propertyVal(result, 'username', educatorJSON.username)
                assert.propertyVal(result, 'password', educatorJSON.password)
                assert.propertyVal(result, 'type', educatorJSON.type)
                assert.deepPropertyVal(result, 'scopes', educatorJSON.scopes)
                assert.isUndefined(result.institution)
                assert.property(result, 'children_groups')
            })
        })

        context('when the parameter is a JSON and does not contain any attributes', () => {
            it('should normally execute the method, returning an Educator as a result of the transformation', () => {
                const result: Educator = new EducatorEntityMapper().transform(emptyEducatorJSON)

                assert.propertyVal(result, 'id', emptyEducatorJSON.id)
                assert.propertyVal(result, 'username', emptyEducatorJSON.username)
                assert.propertyVal(result, 'password', emptyEducatorJSON.password)
                assert.propertyVal(result, 'type', UserType.EDUCATOR)
                assert.deepPropertyVal(result, 'scopes', educatorJSON.scopes)
                assert.propertyVal(result, 'institution', emptyEducatorJSON.institution)
                assert.propertyVal(result, 'children_groups', emptyEducatorJSON.children_groups)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning an Educator as a result of the transformation', () => {
                const result: Educator = new EducatorEntityMapper().transform(undefined)

                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'children_groups', undefined)
            })
        })
    })
})
