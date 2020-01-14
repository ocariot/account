import { assert } from 'chai'
import { ApplicationMock } from '../../mocks/application.mock'
import { Application } from '../../../src/application/domain/model/application'
import { ApplicationEntityMapper } from '../../../src/infrastructure/entity/mapper/application.entity.mapper'
import { ApplicationEntity } from '../../../src/infrastructure/entity/application.entity'
import { UserType } from '../../../src/application/domain/model/user'

describe('Mappers: ApplicationEntity', () => {
    const application: Application = new ApplicationMock()
    application.password = 'application_password'

    // To test how mapper works with an object without any attributes
    const emptyApplication: Application = new Application()
    emptyApplication.type = undefined
    emptyApplication.scopes = undefined!

    // Create application JSON
    const applicationJSON: any = {
        id: '7af80099213acac44369d8a5',
        type: 'application',
        scopes: [
            'applications:read',
            'institutions:read',
            'institutions:readAll',
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
            'environment:create',
            'environment:read',
            'environment:update',
            'environment:delete',
            'socioquest:read',
            'healthquest:read',
            'parentphyquest:read',
            'childrenphyquest:read',
            'habitsquest:read',
            'foodhabitsquest:create',
            'foodhabitsquest:read',
            'perceptionquest:read',
            'missions:create',
            'missions:read',
            'missions:update',
            'missions:delete',
            'gamificationprofile:create',
            'gamificationprofile:read',
            'gamificationprofile:update',
            'gamificationprofile:delete',
            'external:sync'
        ],
        username: 'application_mock',
        password: 'application_password',
        institution: '603c062fda850512e4387e46',
        application_name: 'application test'
    }

    // To test how mapper works with an object without any attributes (JSON)
    const emptyApplicationJSON: any = {}

    describe('transform(item: any)', () => {
        context('when the parameter is of type Application', () => {
            it('should normally execute the method, returning an ApplicationEntity as a result of the transformation', () => {
                const result: ApplicationEntity = new ApplicationEntityMapper().transform(application)
                assert.propertyVal(result, 'id', application.id)
                assert.propertyVal(result, 'username', application.username)
                assert.propertyVal(result, 'password', application.password)
                assert.propertyVal(result, 'type', application.type)
                assert.propertyVal(result, 'scopes', application.scopes)
                assert.propertyVal(result, 'institution', application.institution!.id)
                assert.propertyVal(result, 'application_name', application.application_name)
            })
        })

        context('when the parameter is of type Application and does not contain any attributes', () => {
            it('should normally execute the method, returning an empty ApplicationEntity', () => {
                const result: ApplicationEntity = new ApplicationEntityMapper().transform(emptyApplication)
                assert.isEmpty(result)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning an Application as a result of the transformation', () => {
                const result: Application = new ApplicationEntityMapper().transform(applicationJSON)
                assert.propertyVal(result, 'id', applicationJSON.id)
                assert.propertyVal(result, 'username', applicationJSON.username)
                assert.propertyVal(result, 'password', applicationJSON.password)
                assert.propertyVal(result, 'type', applicationJSON.type)
                assert.deepPropertyVal(result, 'scopes', applicationJSON.scopes)
                assert.equal(result.institution!.id, applicationJSON.institution)
                assert.propertyVal(result, 'application_name', applicationJSON.application_name)
            })
        })

        context('when the parameter is a JSON without an institution', () => {
            it('should not normally execute the method, returning an Application as a result of the transformation', () => {
                applicationJSON.institution = null
                const result: Application = new ApplicationEntityMapper().transform(applicationJSON)
                assert.propertyVal(result, 'id', applicationJSON.id)
                assert.propertyVal(result, 'username', applicationJSON.username)
                assert.propertyVal(result, 'password', applicationJSON.password)
                assert.propertyVal(result, 'type', applicationJSON.type)
                assert.deepPropertyVal(result, 'scopes', applicationJSON.scopes)
                assert.isUndefined(result.institution)
                assert.propertyVal(result, 'application_name', applicationJSON.application_name)
            })
        })

        context('when the parameter is a JSON and does not contain any attributes', () => {
            it('should normally execute the method, returning an Application as a result of the transformation', () => {
                const result: Application = new ApplicationEntityMapper().transform(emptyApplicationJSON)
                assert.propertyVal(result, 'id', emptyApplicationJSON.id)
                assert.propertyVal(result, 'username', emptyApplicationJSON.username)
                assert.propertyVal(result, 'password', emptyApplicationJSON.password)
                assert.propertyVal(result, 'type', UserType.APPLICATION)
                assert.deepPropertyVal(result, 'scopes', applicationJSON.scopes)
                assert.propertyVal(result, 'institution', emptyApplicationJSON.institution)
                assert.propertyVal(result, 'application_name', emptyApplicationJSON.application_name)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning an Application as a result of the transformation', () => {
                const result: Application = new ApplicationEntityMapper().transform(undefined)

                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'application_name', undefined)
            })
        })
    })
})
