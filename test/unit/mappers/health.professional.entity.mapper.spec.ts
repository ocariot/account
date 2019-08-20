import { assert } from 'chai'
import { HealthProfessional } from '../../../src/application/domain/model/health.professional'
import { HealthProfessionalMock } from '../../mocks/health.professional.mock'
import { HealthProfessionalEntityMapper } from '../../../src/infrastructure/entity/mapper/health.professional.entity.mapper'

describe('Mappers: HealthProfessionalEntity', () => {
    const healthProfessional: HealthProfessional = new HealthProfessionalMock()
    healthProfessional.password = 'health_professional_password'

    // Create healthProfessional JSON
    const healthProfessionalJSON: any = {
        id: '1f10db551af31e3a913ebb22',
        type: 'healthprofessional',
        scopes: [
            'healthprofessionals:read',
            'healthprofessionals:update',
            'childrengroups:create',
            'childrengroups:read',
            'childrengroups:update',
            'childrengroups:delete',
            'institutions:read',
            'institutions:readAll',
            'institutions:update',
            'questionnaires:read',
            'foodrecord:read',
            'physicalactivities:read',
            'sleep:read',
            'environment:read',
            'missions:read',
            'gamificationprofile:read'
            ],
        username: 'health_professional_mock',
        password: 'health_professional_password',
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
        context('when the parameter is of type HealthProfessional', () => {
            it('should normally execute the method, returning an HealthProfessionalEntity as a result of the ' +
                'transformation', () => {
                const result = new HealthProfessionalEntityMapper().transform(healthProfessional)
                assert.propertyVal(result, 'id', healthProfessional.id)
                assert.propertyVal(result, 'username', healthProfessional.username)
                assert.propertyVal(result, 'password', healthProfessional.password)
                assert.propertyVal(result, 'type', healthProfessional.type)
                assert.propertyVal(result, 'scopes', healthProfessional.scopes)
                assert.propertyVal(result, 'institution', healthProfessional.institution!.id)
                assert.property(result, 'children_groups')
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning an HealthProfessional as a result of the ' +
                'transformation', () => {
                const result = new HealthProfessionalEntityMapper().transform(healthProfessionalJSON)
                assert.propertyVal(result, 'id', healthProfessionalJSON.id)
                assert.propertyVal(result, 'username', healthProfessionalJSON.username)
                assert.propertyVal(result, 'password', healthProfessionalJSON.password)
                assert.propertyVal(result, 'type', healthProfessionalJSON.type)
                assert.propertyVal(result, 'scopes', healthProfessionalJSON.scopes)
                assert.property(result, 'institution')
                assert.property(result, 'children_groups')
            })
        })

        context('when the parameter is a JSON without an institution', () => {
            it('should not normally execute the method, returning an HealthProfessional as a result of the ' +
                'transformation', () => {
                healthProfessionalJSON.institution = null
                const result = new HealthProfessionalEntityMapper().transform(healthProfessionalJSON)
                assert.propertyVal(result, 'id', healthProfessionalJSON.id)
                assert.propertyVal(result, 'username', healthProfessionalJSON.username)
                assert.propertyVal(result, 'password', healthProfessionalJSON.password)
                assert.propertyVal(result, 'type', healthProfessionalJSON.type)
                assert.propertyVal(result, 'scopes', healthProfessionalJSON.scopes)
                assert.isUndefined(result.institution)
                assert.property(result, 'children_groups')
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning an HealthProfessional as a result of the ' +
                'transformation', () => {
                const result = new HealthProfessionalEntityMapper().transform(undefined)

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
