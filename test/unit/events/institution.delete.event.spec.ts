import { assert } from 'chai'
import { Institution } from '../../../src/application/domain/model/institution'
import { InstitutionMock } from '../../mocks/institution.mock'
import { InstitutionEvent } from '../../../src/application/integration-event/event/institution.event'

describe('IntegrationEvents: InstitutionEvent', () => {
    describe('toJSON()', () => {
        it('should return the institution event', () => {
            const institution: Institution = new InstitutionMock()

            const result = new InstitutionEvent('InstitutionDeleteEvent', new Date(), institution).toJSON()
            assert.propertyVal(result, 'event_name', 'InstitutionDeleteEvent')
            assert.property(result, 'timestamp')
            assert.propertyVal(result.institution, 'id', institution.id)
            assert.propertyVal(result.institution, 'type', institution.type)
            assert.propertyVal(result.institution, 'name', institution.name)
            assert.propertyVal(result.institution, 'address', institution.address)
            assert.propertyVal(result.institution, 'latitude', institution.latitude)
            assert.propertyVal(result.institution, 'longitude', institution.longitude)
        })

        context('when the institution is undefined', () => {
            it('should return empty object', () => {
                const result = new InstitutionEvent('InstitutionDeleteEvent', new Date(), undefined).toJSON()
                assert.isEmpty(result)
            })
        })
    })
})
