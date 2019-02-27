import { ObjectID } from 'bson'
import { assert } from 'chai'
import { Institution } from '../../../src/application/domain/model/institution'

describe('Models: Educator', () => {
    const institutionJSON: any = {
        id: new ObjectID(),
        name: 'InstitutionTest',
        type: 'Institution',
        latitude: 0,
        longitude: 0
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a institution model', () => {
                const result = new Institution().fromJSON(institutionJSON)
                assert.property(result, 'id')
                assert.property(result, 'name')
                assert.propertyVal(result, 'name', institutionJSON.name)
                assert.property(result, 'type')
                assert.propertyVal(result, 'type', institutionJSON.type)
                assert.property(result, 'latitude')
                assert.propertyVal(result, 'latitude', institutionJSON.latitude)
                assert.property(result, 'longitude')
                assert.propertyVal(result, 'longitude', institutionJSON.longitude)
            })
        })

        context('when the json is undefined', () => {
            it('should return a family model with undefined parameters', () => {
                const result = new Institution().fromJSON(undefined)
                assert.property(result, 'id')
                assert.propertyVal(result, 'id', undefined)
                assert.property(result, 'name')
                assert.propertyVal(result, 'name', undefined)
                assert.property(result, 'type')
                assert.propertyVal(result, 'type', undefined)
                assert.property(result, 'latitude')
                assert.propertyVal(result, 'latitude', undefined)
                assert.property(result, 'longitude')
                assert.propertyVal(result, 'longitude', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should return a institution model', () => {
                const result = new Institution().fromJSON(JSON.stringify(institutionJSON))
                assert.property(result, 'id')
                assert.property(result, 'name')
                assert.propertyVal(result, 'name', institutionJSON.name)
                assert.property(result, 'type')
                assert.propertyVal(result, 'type', institutionJSON.type)
                assert.property(result, 'latitude')
                assert.propertyVal(result, 'latitude', institutionJSON.latitude)
                assert.property(result, 'longitude')
                assert.propertyVal(result, 'longitude', institutionJSON.longitude)
            })
        })

        context('when the id contains only blank space', () => {
            it('should return institution model with undefined id', () => {
                const jsonWithBlankInstitutionID: any = {
                    institution_id: ''
                }

                const result = new Institution().fromJSON(jsonWithBlankInstitutionID)
                assert.property(result, 'id')
                assert.propertyVal(result, 'id', undefined)
            })
        })
    })
})
