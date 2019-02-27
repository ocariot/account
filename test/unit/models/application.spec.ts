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
        type: UserType.APPLICATION
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a application model', () => {
                const result = new Application().fromJSON(appJSON)
                assert.property(result, 'id')
                assert.property(result, 'username')
                assert.propertyVal(result, 'username', appJSON.username)
                assert.property(result, 'password')
                assert.propertyVal(result, 'password', appJSON.password)
                assert.property(result, 'type')
                assert.propertyVal(result, 'type', appJSON.type)
                assert.property(result, 'scopes')
                assert.property(result, 'institution')
                assert.property(result, 'application_name')
                assert.propertyVal(result, 'application_name', appJSON.application_name)
            })
        })

        context('when the json is undefined', () => {
            it('should return a application model only with type and scope', () => {
                const result = new Application().fromJSON(undefined)
                assert.property(result, 'id')
                assert.propertyVal(result, 'id', undefined)
                assert.property(result, 'username')
                assert.propertyVal(result, 'username', undefined)
                assert.property(result, 'password')
                assert.propertyVal(result, 'password', undefined)
                assert.property(result, 'type')
                assert.propertyVal(result, 'type', UserType.APPLICATION)
                assert.property(result, 'scopes')
                assert.property(result, 'institution')
                assert.property(result, 'application_name')
                assert.propertyVal(result, 'application_name', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Application model', () => {
                const result = new Application().fromJSON(JSON.stringify(appJSON))
                assert.property(result, 'id')
                assert.property(result, 'username')
                assert.propertyVal(result, 'username', appJSON.username)
                assert.property(result, 'password')
                assert.propertyVal(result, 'password', appJSON.password)
                assert.property(result, 'type')
                assert.propertyVal(result, 'type', appJSON.type)
                assert.property(result, 'scopes')
                assert.property(result, 'institution')
                assert.property(result, 'application_name')
                assert.propertyVal(result, 'application_name', appJSON.application_name)
            })
        })
    })
})
