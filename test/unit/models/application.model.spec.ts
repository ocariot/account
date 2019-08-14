import { Application } from '../../../src/application/domain/model/application'
import { ObjectID } from 'bson'
import { UserType } from '../../../src/application/domain/model/user'
import { assert } from 'chai'

describe('Models: Application', () => {
    const appJSON: any = {
        id: new ObjectID(),
        username: 'ihaveaunknowusername',
        password: 'mysecretkey',
        application_name: 'any name',
        institution: new ObjectID(),
        type: UserType.APPLICATION,
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
            'measurements:create',
            'measurements:read',
            'measurements:delete',
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
        ]
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return an application model', () => {
                const result = new Application().fromJSON(appJSON)
                assert.propertyVal(result, 'id', appJSON.id)
                assert.propertyVal(result, 'username', appJSON.username)
                assert.propertyVal(result, 'password', appJSON.password)
                assert.propertyVal(result, 'type', appJSON.type)
                assert.deepPropertyVal(result, 'scopes', appJSON.scopes)
                assert.deepEqual(new ObjectID(result.institution!.id), appJSON.institution)
                assert.propertyVal(result, 'application_name', appJSON.application_name)
            })
        })

        context('when the json is undefined', () => {
            it('should return an application model only with type and scope', () => {
                const result = new Application().fromJSON(undefined)
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'type', UserType.APPLICATION)
                assert.deepPropertyVal(result, 'scopes', appJSON.scopes)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'application_name', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Application model', () => {
                const result = new Application().fromJSON(JSON.stringify(appJSON))
                assert.propertyVal(result, 'id', appJSON.id.toHexString())
                assert.propertyVal(result, 'username', appJSON.username)
                assert.propertyVal(result, 'password', appJSON.password)
                assert.propertyVal(result, 'type', appJSON.type)
                assert.deepPropertyVal(result, 'scopes', appJSON.scopes)
                assert.property(result, 'institution')
                assert.propertyVal(result, 'application_name', appJSON.application_name)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Application model is correct', () => {
            it('should return a JSON from Application model', () => {
                let result = new Application().fromJSON(appJSON)
                result = result.toJSON()

                assert.propertyVal(result, 'id', appJSON.id)
                assert.propertyVal(result, 'username', appJSON.username)
                assert.propertyVal(result, 'type', appJSON.type)
                assert.deepEqual(new ObjectID(result.institution!.id), appJSON.institution)
                assert.propertyVal(result, 'application_name', appJSON.application_name)
            })
        })
    })
})
