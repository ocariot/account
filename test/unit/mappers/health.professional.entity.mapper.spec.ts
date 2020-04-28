import { assert } from 'chai'
import { HealthProfessional } from '../../../src/application/domain/model/health.professional'
import { HealthProfessionalMock } from '../../mocks/health.professional.mock'
import { HealthProfessionalEntityMapper } from '../../../src/infrastructure/entity/mapper/health.professional.entity.mapper'
import { HealthProfessionalEntity } from '../../../src/infrastructure/entity/health.professional.entity'
import { UserType } from '../../../src/application/domain/model/user'

describe('Mappers: HealthProfessionalEntity', () => {
    const healthProfessional: HealthProfessional = new HealthProfessionalMock()
    healthProfessional.password = 'health_professional_password'
    healthProfessional.children_groups![1].id = undefined

    // To test how mapper works with an object without any attributes
    const emptyHealthProfessional: HealthProfessional = new HealthProfessional()
    emptyHealthProfessional.type = undefined

    // Create healthProfessional JSON
    const healthProfessionalJSON: any = {
        id: '1f10db551af31e3a913ebb22',
        type: 'healthprofessional',
        username: 'health_professional_mock',
        password: 'health_professional_password',
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
                                username: 'child_mock',
                                institution: '273ab3632f16bbd9044753cb',
                                gender: 'female',
                                age: 7
                            },
                            {
                                id: '6d9ce5e4206763d2e221e5c7',
                                type: 'child',
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
    const emptyHealthProfessionalJSON: any = {}

    describe('transform(item: any)', () => {
        context('when the parameter is of type HealthProfessional', () => {
            it('should normally execute the method, returning a HealthProfessionalEntity as a result of the ' +
                'transformation', () => {
                const result: HealthProfessionalEntity = new HealthProfessionalEntityMapper().transform(healthProfessional)
                assert.propertyVal(result, 'id', healthProfessional.id)
                assert.propertyVal(result, 'username', healthProfessional.username)
                assert.propertyVal(result, 'password', healthProfessional.password)
                assert.propertyVal(result, 'type', healthProfessional.type)
                assert.propertyVal(result, 'institution', healthProfessional.institution!.id)
                assert.property(result, 'children_groups')
            })
        })

        context('when the parameter is of type HealthProfessional and does not contain any attributes', () => {
            it('should normally execute the method, returning an empty HealthProfessionalEntity', () => {
                const result: HealthProfessionalEntity = new HealthProfessionalEntityMapper().transform(emptyHealthProfessional)
                assert.isEmpty(result)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning a HealthProfessional as a result of the ' +
                'transformation', () => {
                const result: HealthProfessional = new HealthProfessionalEntityMapper().transform(healthProfessionalJSON)
                assert.propertyVal(result, 'id', healthProfessionalJSON.id)
                assert.propertyVal(result, 'username', healthProfessionalJSON.username)
                assert.propertyVal(result, 'password', healthProfessionalJSON.password)
                assert.propertyVal(result, 'type', healthProfessionalJSON.type)
                assert.property(result, 'institution')
                assert.property(result, 'children_groups')
            })
        })

        context('when the parameter is a JSON without an institution', () => {
            it('should not normally execute the method, returning a HealthProfessional as a result of the ' +
                'transformation', () => {
                healthProfessionalJSON.institution = null
                const result: HealthProfessional = new HealthProfessionalEntityMapper().transform(healthProfessionalJSON)
                assert.propertyVal(result, 'id', healthProfessionalJSON.id)
                assert.propertyVal(result, 'username', healthProfessionalJSON.username)
                assert.propertyVal(result, 'password', healthProfessionalJSON.password)
                assert.propertyVal(result, 'type', healthProfessionalJSON.type)
                assert.isUndefined(result.institution)
                assert.property(result, 'children_groups')
            })
        })

        context('when the parameter is a JSON and does not contain any attributes', () => {
            it('should normally execute the method, returning a HealthProfessional as a result of the transformation', () => {
                const result: HealthProfessional = new HealthProfessionalEntityMapper().transform(emptyHealthProfessionalJSON)

                assert.propertyVal(result, 'id', emptyHealthProfessionalJSON.id)
                assert.propertyVal(result, 'username', emptyHealthProfessionalJSON.username)
                assert.propertyVal(result, 'password', emptyHealthProfessionalJSON.password)
                assert.propertyVal(result, 'type', UserType.HEALTH_PROFESSIONAL)
                assert.propertyVal(result, 'institution', emptyHealthProfessionalJSON.institution)
                assert.propertyVal(result, 'children_groups', emptyHealthProfessionalJSON.children_groups)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning a HealthProfessional as a result of the ' +
                'transformation', () => {
                const result: HealthProfessional = new HealthProfessionalEntityMapper().transform(undefined)

                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'children_groups', undefined)
            })
        })
    })
})
