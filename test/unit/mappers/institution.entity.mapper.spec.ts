import { assert } from 'chai'
import { Institution } from '../../../src/application/domain/model/institution'
import { InstitutionMock } from '../../mocks/institution.mock'
import { InstitutionEntityMapper } from '../../../src/infrastructure/entity/mapper/institution.entity.mapper'

describe('Mappers: InstitutionEntity', () => {
    const institution: Institution = new InstitutionMock()

    // Create healthProfessional JSON
    const healthProfessionalJSON: any = {
        id: 'c984a9dd7a2456422e518363',
        type: 'Institute of Scientific Research',
        name: 'Name Example',
        address: '221B Baker Street, St.',
        latitude: 87.50204435778441,
        longitude: 90.97552741390503
    }

    describe('transform(item: any)', () => {
        context('when the parameter is of type Institution', () => {
            it('should normally execute the method, returning an InstitutionEntity as a result of the ' +
                'transformation', () => {
                const result = new InstitutionEntityMapper().transform(institution)
                assert.propertyVal(result, 'id', institution.id)
                assert.propertyVal(result, 'type', institution.type)
                assert.propertyVal(result, 'name', institution.name)
                assert.propertyVal(result, 'address', institution.address)
                assert.propertyVal(result, 'latitude', institution.latitude)
                assert.propertyVal(result, 'longitude', institution.longitude)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning an Institution as a result of the ' +
                'transformation', () => {
                const result = new InstitutionEntityMapper().transform(healthProfessionalJSON)
                assert.propertyVal(result, 'id', healthProfessionalJSON.id)
                assert.propertyVal(result, 'type', healthProfessionalJSON.type)
                assert.propertyVal(result, 'name', healthProfessionalJSON.name)
                assert.propertyVal(result, 'address', healthProfessionalJSON.address)
                assert.propertyVal(result, 'latitude', healthProfessionalJSON.latitude)
                assert.propertyVal(result, 'longitude', healthProfessionalJSON.longitude)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning an Institution as a result of the ' +
                'transformation', () => {
                const result = new InstitutionEntityMapper().transform(undefined)

                assert.isObject(result)
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
