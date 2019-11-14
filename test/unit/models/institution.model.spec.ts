import { ObjectID } from 'bson'
import { assert } from 'chai'
import { Institution } from '../../../src/application/domain/model/institution'

describe('Models: Educator', () => {
    const institutionJSON: any = {
        id: new ObjectID(),
        name: 'InstitutionTest',
        type: 'Institution',
        address: '221B Baker Street, St.',
        latitude: 0,
        longitude: 0
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a institution model', () => {
                const result = new Institution().fromJSON(institutionJSON)
                assert.propertyVal(result, 'id', institutionJSON.id)
                assert.propertyVal(result, 'name', institutionJSON.name)
                assert.propertyVal(result, 'type', institutionJSON.type)
                assert.propertyVal(result, 'address', institutionJSON.address)
                assert.propertyVal(result, 'latitude', institutionJSON.latitude)
                assert.propertyVal(result, 'longitude', institutionJSON.longitude)
            })
        })

        context('when the json is undefined', () => {
            it('should return a family model with undefined parameters', () => {
                const result = new Institution().fromJSON(undefined)
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'name', undefined)
                assert.propertyVal(result, 'type', undefined)
                assert.propertyVal(result, 'address', undefined)
                assert.propertyVal(result, 'latitude', undefined)
                assert.propertyVal(result, 'longitude', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should return a institution model', () => {
                const result = new Institution().fromJSON(JSON.stringify(institutionJSON))
                assert.propertyVal(result, 'id', institutionJSON.id.toHexString())
                assert.propertyVal(result, 'name', institutionJSON.name)
                assert.propertyVal(result, 'type', institutionJSON.type)
                assert.propertyVal(result, 'address', institutionJSON.address)
                assert.propertyVal(result, 'latitude', institutionJSON.latitude)
                assert.propertyVal(result, 'longitude', institutionJSON.longitude)
            })
        })

        context('when the id contains only blank space', () => {
            it('should return institution model with undefined id', () => {
                const jsonWithBlankInstitutionID: any = {
                    institution_id: ''
                }

                const result = new Institution().fromJSON(jsonWithBlankInstitutionID)
                assert.propertyVal(result, 'id', '')
                assert.propertyVal(result, 'name', undefined)
                assert.propertyVal(result, 'type', undefined)
                assert.propertyVal(result, 'address', undefined)
                assert.propertyVal(result, 'latitude', undefined)
                assert.propertyVal(result, 'longitude', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Institution model is correct', () => {
            it('should return a JSON from Institution model', () => {
                let result = new Institution().fromJSON(institutionJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', institutionJSON.id)
                assert.propertyVal(result, 'name', institutionJSON.name)
                assert.propertyVal(result, 'type', institutionJSON.type)
                assert.propertyVal(result, 'address', institutionJSON.address)
                assert.propertyVal(result, 'latitude', institutionJSON.latitude)
                assert.propertyVal(result, 'longitude', institutionJSON.longitude)
            })
        })
    })
})
