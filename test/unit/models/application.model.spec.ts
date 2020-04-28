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
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return an application model', () => {
                const result = new Application().fromJSON(appJSON)
                assert.propertyVal(result, 'id', appJSON.id)
                assert.propertyVal(result, 'username', appJSON.username)
                assert.propertyVal(result, 'password', appJSON.password)
                assert.propertyVal(result, 'type', appJSON.type)
                assert.deepEqual(new ObjectID(result.institution!.id), appJSON.institution)
                assert.propertyVal(result, 'application_name', appJSON.application_name)
            })
        })

        context('when the json is undefined', () => {
            it('should return an application model only with type', () => {
                const result = new Application().fromJSON(undefined)
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'type', UserType.APPLICATION)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'application_name', undefined)
                assert.propertyVal(result, 'last_login', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Application model', () => {
                const result = new Application().fromJSON(JSON.stringify(appJSON))
                assert.propertyVal(result, 'id', appJSON.id.toHexString())
                assert.propertyVal(result, 'username', appJSON.username)
                assert.propertyVal(result, 'password', appJSON.password)
                assert.propertyVal(result, 'type', appJSON.type)
                assert.deepEqual(new ObjectID(result.institution!.id), appJSON.institution)
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
                assert.propertyVal(result, 'institution_id', appJSON.institution)
                assert.propertyVal(result, 'application_name', appJSON.application_name)
            })
        })
    })
})
