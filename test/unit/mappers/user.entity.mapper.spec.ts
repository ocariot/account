import { assert } from 'chai'
import { UserMock, UserTypeMock } from '../../mocks/user.mock'
import { User } from '../../../src/application/domain/model/user'
import { UserEntityMapper } from '../../../src/infrastructure/entity/mapper/user.entity.mapper'
import { UserEntity } from '../../../src/infrastructure/entity/user.entity'

describe('Mappers: UserEntity', () => {
    const user: User = new UserMock()
    user.type = UserTypeMock.CHILD
    user.password = 'user_password'

    // To test how mapper works with an object without any attributes
    const emptyUser: User = new User()

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
        }
    }

    // To test how mapper works with an object without any attributes (JSON)
    const emptyUserJSON: any = {}

    describe('transform(item: any)', () => {
        context('when the parameter is of type User', () => {
            it('should normally execute the method, returning an UserEntity as a result of the transformation', () => {
                const result: UserEntity = new UserEntityMapper().transform(user)
                assert.propertyVal(result, 'id', user.id)
                assert.propertyVal(result, 'username', user.username)
                assert.propertyVal(result, 'password', user.password)
                assert.propertyVal(result, 'type', user.type)
                assert.propertyVal(result, 'institution', user.institution!.id)
            })
        })

        context('when the parameter is of type User and does not contain any attributes', () => {
            it('should normally execute the method, returning an empty ApplicationEntity', () => {
                const result: UserEntity = new UserEntityMapper().transform(emptyUser)
                assert.isEmpty(result)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning an User as a result of the transformation', () => {
                const result: User = new UserEntityMapper().transform(userJSON)
                assert.propertyVal(result, 'id', userJSON.id)
                assert.propertyVal(result, 'username', userJSON.username)
                assert.propertyVal(result, 'password', userJSON.password)
                assert.propertyVal(result, 'type', userJSON.type)
                assert.deepEqual(result.institution!.id, userJSON.institution)
            })
        })

        context('when the parameter is a JSON without an institution', () => {
            it('should not normally execute the method, returning an User as a result of the transformation', () => {
                userJSON.institution = null
                const result: User = new UserEntityMapper().transform(userJSON)
                assert.propertyVal(result, 'id', userJSON.id)
                assert.propertyVal(result, 'username', userJSON.username)
                assert.propertyVal(result, 'password', userJSON.password)
                assert.propertyVal(result, 'type', userJSON.type)
                assert.isUndefined(result.institution)
            })
        })

        context('when the parameter is a JSON and does not contain any attributes', () => {
            it('should normally execute the method, returning an User as a result of the transformation', () => {
                const result: User = new UserEntityMapper().transform(emptyUserJSON)
                assert.propertyVal(result, 'id', emptyUserJSON.id)
                assert.propertyVal(result, 'username', emptyUserJSON.username)
                assert.propertyVal(result, 'password', emptyUserJSON.password)
                assert.propertyVal(result, 'type', emptyUserJSON.type)
                assert.propertyVal(result, 'institution', emptyUserJSON.institution)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning an User as a result of the transformation', () => {
                const result: User = new UserEntityMapper().transform(undefined)

                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'type', undefined)
                assert.propertyVal(result, 'institution', undefined)
            })
        })
    })
})
