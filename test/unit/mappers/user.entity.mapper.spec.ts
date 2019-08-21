import { assert } from 'chai'
import { UserMock, UserTypeMock } from '../../mocks/user.mock'
import { User } from '../../../src/application/domain/model/user'
import { UserEntityMapper } from '../../../src/infrastructure/entity/mapper/user.entity.mapper'

describe('Mappers: UserEntity', () => {
    const user: User = new UserMock()
    user.type = UserTypeMock.CHILD
    user.scopes = new Array<string>('readonly')
    user.password = 'user_password'

    // Create user JSON
    const userJSON: any = {
        id: '1547c6eef20110c2061af8fc',
        username: 'user_mock',
        password: 'user_password',
        institution: {
            id: '033cefe37b43aaaaa85f2851',
            type: 'Institute of Scientific Research',
            name: 'Name Example',
            address: '221B Baker Street, St.',
            latitude: 16.444253797043274,
            longitude: 88.34393529265958
        },
        last_login: user.last_login
    }

    describe('transform(item: any)', () => {
        context('when the parameter is of type User', () => {
            it('should normally execute the method, returning a UserEntity as a result of the transformation', () => {
                const result = new UserEntityMapper().transform(user)
                assert.propertyVal(result, 'id', user.id)
                assert.propertyVal(result, 'username', user.username)
                assert.propertyVal(result, 'password', user.password)
                assert.propertyVal(result, 'type', user.type)
                assert.propertyVal(result, 'scopes', user.scopes)
                assert.propertyVal(result, 'institution', user.institution!.id)
                assert.propertyVal(result, 'last_login', user.last_login)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning a User as a result of the transformation', () => {
                const result = new UserEntityMapper().transform(userJSON)
                assert.propertyVal(result, 'id', userJSON.id)
                assert.propertyVal(result, 'username', userJSON.username)
                assert.propertyVal(result, 'password', userJSON.password)
                assert.propertyVal(result, 'type', userJSON.type)
                assert.propertyVal(result, 'scopes', userJSON.scopes)
                assert.deepEqual(result.institution.toJSON(), userJSON.institution)
                assert.propertyVal(result, 'last_login', userJSON.last_login)
            })
        })

        context('when the parameter is a JSON without an institution', () => {
            it('should not normally execute the method, returning a User as a result of the transformation', () => {
                userJSON.institution = null
                const result = new UserEntityMapper().transform(userJSON)
                assert.propertyVal(result, 'id', userJSON.id)
                assert.propertyVal(result, 'username', userJSON.username)
                assert.propertyVal(result, 'password', userJSON.password)
                assert.propertyVal(result, 'type', userJSON.type)
                assert.propertyVal(result, 'scopes', userJSON.scopes)
                assert.isUndefined(result.institution)
                assert.propertyVal(result, 'last_login', userJSON.last_login)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning a User as a result of the transformation', () => {
                const result = new UserEntityMapper().transform(undefined)

                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'type', undefined)
                assert.propertyVal(result, 'scopes', undefined)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'last_login', undefined)
            })
        })
    })
})
