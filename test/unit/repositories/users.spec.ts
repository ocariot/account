import sinon from 'sinon'
import { User } from './../../../src/models/user'
import { UserRepository } from '../../../src/repositories/user.repository';
import { assert } from 'chai'
import { IExceptionError } from '../../../src/exceptions/api.exception';
import { ObjectID } from 'bson';

require('sinon-mongoose')

const UserFake: any = User

describe('Repositories: Users', () => {

    const defaultUser: any = {
        "id": "5b13826de00324086854584a",
        "user_name": "br-schoolA-studentB",
        "password": "lorem123",
        "school": {
            "name": "Unifor",
            "country": "BR",
            "city": "Fortaleza",
            "address": "Av. Washington Soares, 1321 - Edson Queiroz, Fortaleza - CE, 60811-905"
        },
        "created_at": new Date('2018-11-21 21:25:05')
    }

    const defaultQuery: any = {
        fields: {},
        ordination: {},
        pagination: { page: 1, limit: 100 },
        filters: {}
    }

    afterEach(() => {
        sinon.restore()
    })

    describe('save()', () => {
        context('when the parameters are correct', () => {
            it('should return the saved user', () => {

                const expectUser: any = defaultUser

                sinon
                    .mock(UserFake)
                    .expects('create')
                    .withArgs(defaultUser)
                    .resolves(defaultUser)

                const userRepository: any = new UserRepository(UserFake)

                return userRepository.save(defaultUser)
                    .then((user) => {
                        assert.isNotNull(user)
                        assert.property(user, 'user_name')
                        assert.propertyVal(user, 'user_name', defaultUser.user_name)
                        assert.property(user, 'password')
                        assert.propertyVal(user, 'password', defaultUser.password)
                        assert.property(user, 'school')
                        assert.propertyVal(user, 'school', defaultUser.school)
                        assert.property(user, 'created_at')
                    })
            })
        })

        context('when there are validation errors', () => {
            it('should return info message from missing required fields', () => {

                const incompleteUser: any = {
                    "user_name": "Incomplete Example",
                    "password": "123"
                }

                sinon
                    .mock(UserFake)
                    .expects('create')
                    .withArgs(incompleteUser)
                    .rejects({ name: 'ValidationError' })

                const userRepository: any = new UserRepository(UserFake)

                return userRepository.save(incompleteUser)
                    .catch((err: IExceptionError) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 400)
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                    })
            })
        })

        context('when data already exists', () => {
            it('should return info message from duplicated data', () => {

                sinon
                    .mock(UserFake)
                    .expects('create')
                    .withArgs(defaultUser)
                    .rejects({ name: 'MongoError', code: 11000 })

                const userRepository: any = new UserRepository(UserFake)

                return userRepository.save(defaultUser)
                    .catch((err: IExceptionError) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 409)
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                    })
            })
        })
    })

    describe('getAll()', () => {
        it('should return a list of users', () => {

            const resultExpected: any = [defaultUser]

            sinon
                .mock(UserFake)
                .expects('find')
                .chain('select')
                .withArgs({})
                .chain('sort')
                .withArgs()
                .chain('skip')
                .withArgs(0)
                .chain('limit')
                .withArgs(100)
                .chain('exec')
                .resolves(resultExpected)

            const userRepository: any = new UserRepository(UserFake)

            return userRepository.getAll(defaultQuery)
                .then((users) => {
                    assert.isNotNull(users)
                    assert.equal(users.length, resultExpected.length)
                    assert.property(users[0], 'user_name')
                    assert.propertyVal(users[0], 'user_name', defaultUser.user_name)
                    assert.property(users[0], 'password')
                    assert.propertyVal(users[0], 'password', defaultUser.password)
                    assert.property(users[0], 'school')
                    assert.propertyVal(users[0], 'school', defaultUser.school)
                    assert.property(users[0], 'created_at')
                })
        })

        context('when there are no users in database', () => {
            it('should return info message from users not found', () => {

                sinon
                    .mock(UserFake)
                    .expects('find')
                    .chain('select')
                    .withArgs({})
                    .chain('sort')
                    .withArgs()
                    .chain('skip')
                    .withArgs(0)
                    .chain('limit')
                    .withArgs(100)
                    .chain('exec')
                    .resolves([])

                let userRepository: any = new UserRepository(UserFake)

                return userRepository.getAll(defaultQuery)
                    .catch((err) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 404)
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                    })
            })
        })
    })

    describe('getById()', () => {
        it('should return a unique user', () => {

            const customQueryMock: any = {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100 },
                filters: { id: defaultUser.id }
            }

            sinon
                .mock(UserFake)
                .expects('findOne')
                .withArgs({ id: defaultUser.id })
                .chain('select')
                .withArgs({})
                .chain('exec')
                .resolves(defaultUser)

            const userRepository: any = new UserRepository(UserFake)

            return userRepository.getById(customQueryMock)
                .then((user) => {
                    assert.isNotNull(user)
                    assert.property(user, 'user_name')
                    assert.propertyVal(user, 'user_name', defaultUser.user_name)
                    assert.property(user, 'password')
                    assert.propertyVal(user, 'password', defaultUser.password)
                    assert.property(user, 'school')
                    assert.propertyVal(user, 'school', defaultUser.school)
                    assert.property(user, 'created_at')
                })
        })

        context('when the user is not found', () => {
            it('should return info message from user not found', () => {

                const randomId: any = new ObjectID()

                const customQueryMock: any = {
                    fields: {},
                    ordination: {},
                    pagination: { page: 1, limit: 100 },
                    filters: { id: randomId }
                }

                sinon
                    .mock(UserFake)
                    .expects('findOne')
                    .withArgs({ id: randomId })
                    .chain('select')
                    .withArgs({})
                    .chain('exec')
                    .resolves(undefined)

                const userRepository: any = new UserRepository(UserFake)

                return userRepository.getById(customQueryMock)
                    .catch((err: any) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 404)
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                    })
            })
        })

        context('when the user id is invalid', () => {
            it('should return info message about invalid parameter', () => {

                const invalidId: string = '1a2b3c'

                const customQueryMock: any = {
                    fields: {},
                    ordination: {},
                    pagination: { page: 1, limit: 100 },
                    filters: { id: invalidId }
                }

                sinon
                    .mock(UserFake)
                    .expects('findOne')
                    .withArgs({ id: invalidId })
                    .chain('select')
                    .withArgs({})
                    .chain('exec')
                    .rejects({ name: 'CastError' })

                const userRepository: any = new UserRepository(UserFake)

                return userRepository.getById(customQueryMock)
                    .catch((err: any) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 400)
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                    })

            })
        })
    })

    describe('update()', () => {
        it('should return the updated user', () => {

            sinon
                .mock(UserFake)
                .expects('findOneAndUpdate')
                .withArgs({ _id: defaultUser.id }, defaultUser, { new: true })
                .chain('exec')
                .resolves(defaultUser)

            const userRepository: any = new UserRepository(UserFake)

            return userRepository.update(defaultUser)
                .then((user) => {
                    assert.isNotNull(user)
                    assert.property(user, 'user_name')
                    assert.propertyVal(user, 'user_name', defaultUser.user_name)
                    assert.property(user, 'password')
                    assert.propertyVal(user, 'password', defaultUser.password)
                    assert.property(user, 'school')
                    assert.propertyVal(user, 'school', defaultUser.school)
                    assert.property(user, 'created_at')
                })
        })

        context('when data already exists', () => {
            it('should return info message from duplicated data', () => {
                sinon
                    .mock(UserFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultUser.id }, defaultUser, { new: true })
                    .chain('exec')
                    .rejects({ name: 'MongoError', code: 11000 })

                const userRepository: any = new UserRepository(UserFake)

                return userRepository.update(defaultUser)
                    .catch((err: any) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 409)
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                    })
            })
        })

        context('when the user is not found', () => {
            it('should return info message from user not found', () => {

                sinon
                    .mock(UserFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultUser.id }, defaultUser, { new: true })
                    .chain('exec')
                    .resolves(undefined)

                const userRepository: any = new UserRepository(UserFake)

                return userRepository.update(defaultUser)
                    .catch((err: any) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 404)
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                    })
            })
        })

        context('when the user id is invalid', () => {
            it('should return info message about invalid parameter', () => {

                const invalidUser: any = {
                    "id": "1a2b3c",
                    "user_name": "br-schoolA-studentB",
                    "password": "lorem123",
                    "school": {
                        "name": "Unifor",
                        "country": "BR",
                        "city": "Fortaleza",
                        "address": "Av. Washington Soares, 1321 - Edson Queiroz, Fortaleza - CE, 60811-905"
                    },
                    "created_at": new Date('2018-11-21 21:25:05')
                }

                sinon
                    .mock(UserFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: invalidUser.id }, invalidUser, { new: true })
                    .chain('exec')
                    .rejects({ name: 'CastError' })

                const userRepository: any = new UserRepository(UserFake)

                return userRepository.update(invalidUser)
                    .catch((err: any) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 400)
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                    })
            })
        })
    })

    describe('delete()', () => {
        it('should return true for confirm delete', () => {

            const userId: string = '5b13826de00324086854584a' // The defaultUser id, but only the string

            sinon
                .mock(UserFake)
                .expects('findOneAndDelete')
                .withArgs({ _id: userId })
                .chain('exec')
                .resolves(true)

            const userRepository: any = new UserRepository(UserFake)

            return userRepository.delete(userId)
                .then((isDeleted: Boolean) => {
                    assert.isBoolean(isDeleted)
                    assert.isTrue(isDeleted)
                })
        })

        context('when the user is not found', () => {
            it('should return false for confirm that user is not founded', () => {

                const randomId: any = new ObjectID()

                sinon
                    .mock(UserFake)
                    .expects('findOneAndDelete')
                    .withArgs({ _id: randomId })
                    .chain('exec')
                    .resolves(false)

                const userRepository: any = new UserRepository(UserFake)

                return userRepository.delete(randomId)
                    .catch((err: IExceptionError) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 404)
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                    })
            })
        })

        context('when the user id is invalid', () => {
            it('should return info message about invalid parameter', () => {

                const invalidId: string = '1a2b3c'

                sinon
                    .mock(UserFake)
                    .expects('findOneAndDelete')
                    .withArgs({ _id: invalidId })
                    .chain('exec')
                    .rejects({ name: 'CastError' })

                const userRepository: any = new UserRepository(UserFake)

                return userRepository.delete(invalidId)
                    .catch((err: any) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 400)
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                    })
            })
        })
    })
})
