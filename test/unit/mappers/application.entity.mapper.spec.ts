import { assert } from 'chai'
import { ApplicationMock } from '../../mocks/application.mock'
import { Application } from '../../../src/application/domain/model/application'
import { ApplicationEntityMapper } from '../../../src/infrastructure/entity/mapper/application.entity.mapper'

describe('Mappers: ApplicationEntity', () => {
    const application: Application = new ApplicationMock()
    application.password = 'application_password'

    // Create application JSON
    const applicationJSON: any = {
        id: '7af80099213acac44369d8a5',
        type: 'application',
        scopes: [
            'applications:read',
            'institutions:read',
            'institutions:readAll',
            'questionnaires:create',
            'questionnaires:read',
            'foodrecord:create',
            'foodrecord:read',
            'physicalactivities:create',
            'physicalactivities:read',
            'physicalactivities:update',
            'physicalactivities:delete',
            'sleep:create',
            'sleep:read',
            'sleep:update',
            'sleep:delete',
            'environment:create',
            'environment:read',
            'environment:update',
            'environment:delete',
            'missions:create',
            'missions:read',
            'missions:update',
            'missions:delete',
            'gamificationprofile:create',
            'gamificationprofile:read',
            'gamificationprofile:update',
            'gamificationprofile:delete'
        ],
        username: 'application_mock',
        password: 'application_password',
        institution: {
            id: '603c062fda850512e4387e46',
            type: 'Institute of Scientific Research',
            name: 'Name Example',
            address: '221B Baker Street, St.',
            latitude: 67.00036478975976,
            longitude: 44.89460385871634
        },
        application_name: 'application test'
    }

    describe('transform(item: any)', () => {
        context('when the parameter is of type Application', () => {
            it('should normally execute the method, returning an ApplicationEntity as a result of the transformation', () => {
                const result = new ApplicationEntityMapper().transform(application)
                assert.propertyVal(result, 'id', application.id)
                assert.propertyVal(result, 'username', application.username)
                assert.propertyVal(result, 'password', application.password)
                assert.propertyVal(result, 'type', application.type)
                assert.propertyVal(result, 'scopes', application.scopes)
                assert.propertyVal(result, 'institution', application.institution!.id)
                assert.propertyVal(result, 'application_name', application.application_name)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning an Application as a result of the transformation', () => {
                const result = new ApplicationEntityMapper().transform(applicationJSON)
                assert.propertyVal(result, 'id', applicationJSON.id)
                assert.propertyVal(result, 'username', applicationJSON.username)
                assert.propertyVal(result, 'password', applicationJSON.password)
                assert.propertyVal(result, 'type', applicationJSON.type)
                assert.deepPropertyVal(result, 'scopes', application.scopes)
                assert.property(result, 'institution')
                assert.propertyVal(result, 'application_name', applicationJSON.application_name)
            })
        })

        context('when the parameter is a JSON without an institution', () => {
            it('should not normally execute the method, returning an Application as a result of the transformation', () => {
                applicationJSON.institution = null
                const result = new ApplicationEntityMapper().transform(applicationJSON)
                assert.propertyVal(result, 'id', applicationJSON.id)
                assert.propertyVal(result, 'username', applicationJSON.username)
                assert.propertyVal(result, 'password', applicationJSON.password)
                assert.propertyVal(result, 'type', applicationJSON.type)
                assert.deepPropertyVal(result, 'scopes', application.scopes)
                assert.isUndefined(result.institution)
                assert.propertyVal(result, 'application_name', applicationJSON.application_name)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning an Application as a result of the transformation', () => {
                const result = new ApplicationEntityMapper().transform(undefined)

                assert.isObject(result)
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'application_name', undefined)
            })
        })
    })
})
