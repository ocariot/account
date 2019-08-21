import sinon from 'sinon'
import { BaseRepository } from '../../../src/infrastructure/repository/base/base.repository'
import { User, UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { Application } from '../../../src/application/domain/model/application'
import { assert } from 'chai'
import { ObjectID } from 'bson'
import { IEntityMapper } from '../../../src/infrastructure/port/entity.mapper.interface'
import { ILogger } from '../../../src/utils/custom.logger'
import { Entity } from '../../../src/application/domain/model/entity'
import { UserMock, UserTypeMock } from '../../mocks/user.mock'

require('sinon-mongoose')

class TestRepository<T extends Entity, TModel> extends BaseRepository<any, any> {
    constructor(
        readonly userModel: any,
        readonly userMapper: IEntityMapper<T, TModel>,
        readonly logger: ILogger
    ) {
        super(userModel, userMapper, logger)
    }
}

describe('Repositories: Base', () => {

    const defaultUser: User = new UserMock(UserTypeMock.ADMIN)

    const modelFake: any = UserRepoModel
    const repo = new TestRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: {}
            }
        }
    }

    afterEach(() => {
        sinon.restore()
    })

    describe('create(item: T)', () => {
        context('when a database error occurs (arguments not passed to findOne)', () => {
            it('should throw a ValidationException', () => {

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .chain('exec')
                    .resolves(defaultUser)

                return repo.create(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Invalid query parameters!')
                    })
            })
        })

        context('when a database error occurs (internal error in the database)', () => {
            it('should throw a RepositoryException', () => {

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return repo.create(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('find()', () => {
        it('should return a list of users', () => {

            const resultExpected = new Array<User>(defaultUser)

            sinon
                .mock(modelFake)
                .expects('find')
                .chain('sort')
                .withArgs(queryMock.toJSON().ordination)
                .chain('skip')
                .withArgs(queryMock.toJSON().pagination.skip)
                .chain('limit')
                .withArgs(queryMock.toJSON().pagination.limit)
                .chain('exec')
                .resolves(resultExpected)

            return repo.find(queryMock)
                .then((users: Array<Application>) => {
                    assert.isNotEmpty(users)
                    users[0] = users[0].toJSON()
                    assert.propertyVal(users[0], 'id', defaultUser.id)
                    assert.propertyVal(users[0], 'username', defaultUser.username)
                    assert.propertyVal(users[0], 'type', defaultUser.type)
                    assert.deepPropertyVal(users[0], 'institution_id', defaultUser.institution!.id)
                    assert.propertyVal(users[0], 'last_login', defaultUser.last_login!.toISOString())
                })
        })

        context('when there are no application in database', () => {
            it('should return a empty list', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('sort')
                    .withArgs(queryMock.toJSON().ordination)
                    .chain('skip')
                    .withArgs(queryMock.toJSON().pagination.skip)
                    .chain('limit')
                    .withArgs(queryMock.toJSON().pagination.limit)
                    .chain('exec')
                    .resolves([])

                return repo.find(queryMock)
                    .then(users => {
                        assert.isArray(users)
                        assert.isEmpty(users)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('sort')
                    .withArgs(queryMock.toJSON().ordination)
                    .chain('skip')
                    .withArgs(queryMock.toJSON().pagination.skip)
                    .chain('limit')
                    .withArgs(queryMock.toJSON().pagination.limit)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return repo.find(queryMock)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findOne()', () => {
        const customQueryMock: any = {
            toJSON: () => {
                return {
                    fields: {},
                    ordination: {},
                    pagination: { page: 1, limit: 100 },
                    filters: { id: defaultUser.id }
                }
            }
        }

        it('should return a unique application', () => {
            sinon
                .mock(modelFake)
                .expects('findOne')
                .withArgs(customQueryMock.toJSON().filters)
                .chain('exec')
                .resolves(defaultUser)

            return repo.findOne(customQueryMock)
                .then(user => {
                    user = user.toJSON()
                    assert.propertyVal(user, 'id', user.id)
                    assert.propertyVal(user, 'username', user.username)
                    assert.propertyVal(user, 'type', user.type)
                    assert.deepPropertyVal(user, 'institution_id', defaultUser.institution!.id)
                    assert.propertyVal(user, 'last_login', defaultUser.last_login!.toISOString())
                })
        })

        context('when the application is not found', () => {
            it('should return undefined', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves()

                return repo.findOne(customQueryMock)
                    .then(user => {
                        assert.isNotObject(user)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return repo.findOne(customQueryMock)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('update()', () => {
        it('should return the updated user', () => {
            sinon
                .mock(modelFake)
                .expects('findOneAndUpdate')
                .withArgs({ _id: defaultUser.id }, defaultUser, { new: true })
                .chain('exec')
                .resolves(defaultUser)

            return repo.update(defaultUser)
                .then(user => {
                    user = user.toJSON()
                    assert.propertyVal(user, 'id', user.id)
                    assert.propertyVal(user, 'username', user.username)
                    assert.propertyVal(user, 'type', user.type)
                    assert.deepPropertyVal(user, 'institution_id', defaultUser.institution!.id)
                    assert.propertyVal(user, 'last_login', defaultUser.last_login!.toISOString())
                })
        })

        context('when the user is not found', () => {
            it('should return info message from user not found', () => {

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultUser.id }, defaultUser, { new: true })
                    .chain('exec')
                    .resolves(undefined)

                return repo.update(defaultUser)
                    .then((result: any) => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the user id is invalid', () => {
            it('should return info message about invalid parameter', () => {

                const invalidUser: User = new UserMock()

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: invalidUser.id }, invalidUser, { new: true })
                    .chain('exec')
                    .rejects({ name: 'CastError' })

                return repo.update(invalidUser)
                    .catch((err: any) => {
                        assert.propertyVal(err, 'message', 'The given ID is in invalid format.')
                    })
            })

        })
    })

    describe('delete()', () => {
        it('should return true for confirm delete', () => {

            const userId: string = '5b13826de00324086854584a' // The defaultUser id, but only the string

            sinon
                .mock(modelFake)
                .expects('findOneAndDelete')
                .withArgs({ _id: userId })
                .chain('exec')
                .resolves(true)

            return repo.delete(userId)
                .then((isDeleted: boolean) => {
                    assert.isTrue(isDeleted)
                })
        })

        context('when the user is not found', () => {
            it('should return false for confirm that user is not founded', () => {

                const randomId: any = new ObjectID()

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ _id: randomId })
                    .chain('exec')
                    .resolves(false)

                return repo.delete(randomId)
                    .then((isDeleted: boolean) => {
                        assert.isFalse(isDeleted)
                    })
            })
        })

        context('when the user id is invalid', () => {
            it('should return info message about invalid parameter', () => {

                const invalidId: string = '1a2b3c'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ _id: invalidId })
                    .chain('exec')
                    .rejects({ name: 'CastError' })

                return repo.delete(invalidId)
                    .catch((err: any) => {
                        assert.propertyVal(err, 'message', 'The given ID is in invalid format.')
                    })
            })
        })
    })

    describe('count()', () => {
        it('should return how many users there are in the database for a query', () => {

            const customQueryMock: any = {
                toJSON: () => {
                    return {
                        fields: {},
                        ordination: {},
                        pagination: { page: 1, limit: 100 },
                        filters: { type: UserType.ADMIN }
                    }
                }
            }

            sinon
                .mock(modelFake)
                .expects('countDocuments')
                .withArgs(customQueryMock.toJSON().filters)
                .chain('exec')
                .resolves(1)

            return repo.count(customQueryMock)
                .then((countUsers: number) => {
                    assert.isNumber(countUsers)
                    assert.equal(countUsers, 1)
                })
        })

        context('when there no are users in database for a query', () => {
            it('should return 0', () => {

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100 },
                            filters: { type: 3 }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(0)

                return repo.count(customQueryMock)
                    .then((countUsers: number) => {
                        assert.isNumber(countUsers)
                        assert.equal(countUsers, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100 },
                            filters: { type: 3 }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return repo.count(customQueryMock)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

})
