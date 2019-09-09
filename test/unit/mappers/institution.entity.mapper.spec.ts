import { assert } from 'chai'
import { Institution } from '../../../src/application/domain/model/institution'
import { InstitutionMock } from '../../mocks/institution.mock'
import { InstitutionEntityMapper } from '../../../src/infrastructure/entity/mapper/institution.entity.mapper'
import { InstitutionEntity } from '../../../src/infrastructure/entity/institution.entity'

describe('Mappers: InstitutionEntity', () => {
    const institution: Institution = new InstitutionMock()

    // To test how mapper works with an object without any attributes
    const emptyInstitution: Institution = new Institution()

    // Create healthProfessional JSON
    const institutionJSON: any = {
        id: 'c984a9dd7a2456422e518363',
        type: 'Institute of Scientific Research',
        name: 'Name Example',
        address: '221B Baker Street, St.',
        latitude: 87.50204435778441,
        longitude: 90.97552741390503
    }

    // To test how mapper works with an object without any attributes (JSON)
    const emptyInstitutionJSON: any = {}

    describe('transform(item: any)', () => {
        context('when the parameter is of type Institution', () => {
            it('should normally execute the method, returning an InstitutionEntity as a result of the ' +
                'transformation', () => {
                const result: InstitutionEntity = new InstitutionEntityMapper().transform(institution)
                assert.propertyVal(result, 'id', institution.id)
                assert.propertyVal(result, 'type', institution.type)
                assert.propertyVal(result, 'name', institution.name)
                assert.propertyVal(result, 'address', institution.address)
                assert.propertyVal(result, 'latitude', institution.latitude)
                assert.propertyVal(result, 'longitude', institution.longitude)
            })
        })

        context('when the parameter is of type Institution and does not contain any attributes', () => {
            it('should normally execute the method, returning an empty InstitutionEntity', () => {
                const result: InstitutionEntity = new InstitutionEntityMapper().transform(emptyInstitution)
                assert.isEmpty(result)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning an Institution as a result of the ' +
                'transformation', () => {
                const result: Institution = new InstitutionEntityMapper().transform(institutionJSON)
                assert.propertyVal(result, 'id', institutionJSON.id)
                assert.propertyVal(result, 'type', institutionJSON.type)
                assert.propertyVal(result, 'name', institutionJSON.name)
                assert.propertyVal(result, 'address', institutionJSON.address)
                assert.propertyVal(result, 'latitude', institutionJSON.latitude)
                assert.propertyVal(result, 'longitude', institutionJSON.longitude)
            })
        })

        context('when the parameter is a JSON and does not contain any attributes', () => {
            it('should normally execute the method, returning an Institution as a result of the transformation', () => {
                const result: Institution = new InstitutionEntityMapper().transform(emptyInstitutionJSON)
                assert.propertyVal(result, 'id', emptyInstitutionJSON.id)
                assert.propertyVal(result, 'type', emptyInstitutionJSON.type)
                assert.propertyVal(result, 'name', emptyInstitutionJSON.name)
                assert.propertyVal(result, 'address', emptyInstitutionJSON.address)
                assert.propertyVal(result, 'latitude', emptyInstitutionJSON.latitude)
                assert.propertyVal(result, 'longitude', emptyInstitutionJSON.longitude)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning an Institution as a result of the ' +
                'transformation', () => {
                const result: Institution = new InstitutionEntityMapper().transform(undefined)

                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'type', undefined)
                assert.propertyVal(result, 'name', undefined)
                assert.propertyVal(result, 'address', undefined)
                assert.propertyVal(result, 'latitude', undefined)
                assert.propertyVal(result, 'longitude', undefined)
            })
        })
    })
})
