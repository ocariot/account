import sinon from 'sinon'
import { BaseRepository } from '../../../src/infrastructure/repository/base/base.repository'
import { Institution } from '../../../src/application/domain/model/institution'
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

    const institution: Institution = new Institution()
    institution.id = '5b13826de00324086854584b'
    institution.type = 'Any Type'
    institution.name = 'Name Example'
    institution.address = '221B Baker Street, St.'
    institution.latitude = 0
    institution.longitude = 0

    const defaultUser: User = new User()
    defaultUser.id = '5b13826de00324086854584b'
    defaultUser.username = 'usertest'
    defaultUser.password = 'userpass'
    defaultUser.type = UserType.ADMIN
    defaultUser.institution = institution
    defaultUser.scopes = new Array<string>('i-can-everything')

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

    // TODO implement test for create method
    describe('create()', () => {
        it('Not implemented yet.', () => {
            return repo
        })
    })

    describe('find()', () => {
        it('should return a list of users', () => {

            const resultExpected = new Array<User>(defaultUser)

            sinon
                .mock(modelFake)
                .expects('find')
                .chain('select')
                .withArgs(queryMock.toJSON().fields)
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
                    assert.property(users[0], 'id')
                    assert.propertyVal(users[0], 'id', defaultUser.id)
                    assert.property(users[0], 'username')
                    assert.propertyVal(users[0], 'username', defaultUser.username)
                    assert.property(users[0], 'type')
                    assert.propertyVal(users[0], 'type', defaultUser.type)
                    assert.property(users[0], 'institution')
                    assert.deepPropertyVal(users[0], 'institution', institution.toJSON())
                })
        })

        context('when there are no application in database', () => {
            it('should return a empty list', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('select')
                    .withArgs(queryMock.toJSON().fields)
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
                        assert.isEmpty(users)
                        assert.equal(users.length, 0)
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
                .chain('select')
                .withArgs(customQueryMock.toJSON().fields)
                .chain('exec')
                .resolves(defaultUser)

            return repo.findOne(customQueryMock)
                .then(user => {
                    user = user.toJSON()
                    assert.property(user, 'id')
                    assert.propertyVal(user, 'id', user.id)
                    assert.property(user, 'username')
                    assert.propertyVal(user, 'username', user.username)
                    assert.property(user, 'type')
                    assert.propertyVal(user, 'type', user.type)
                    assert.property(user, 'institution')
                    assert.deepPropertyVal(user, 'institution', institution.toJSON())
                })
        })

        context('when the application is not found', () => {
            it('should return undefined', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('select')
                    .withArgs(customQueryMock.toJSON().fields)
                    .chain('exec')
                    .resolves()

                return repo.findOne(customQueryMock)
                    .then(user => {
                        assert.isNotObject(user)
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
                    assert.property(user, 'id')
                    assert.propertyVal(user, 'id', user.id)
                    assert.property(user, 'username')
                    assert.propertyVal(user, 'username', user.username)
                    assert.property(user, 'type')
                    assert.propertyVal(user, 'type', user.type)
                    assert.property(user, 'institution')
                    assert.deepPropertyVal(user, 'institution', institution.toJSON())
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
                        assert.isNotNull(result)
                        assert.isUndefined(result)
                        assert.isNotObject(result)
                    })
            })
        })

        context('when the user id is invalid', () => {
            it('should return info message about invalid parameter', () => {

                const invalidUser: User = new User()
                invalidUser.id = '5b13826de00324086854584b'
                invalidUser.username = 'usertest'
                invalidUser.password = 'userpass'
                invalidUser.type = UserType.ADMIN
                invalidUser.institution = institution
                invalidUser.scopes = new Array<string>('i-can-everything')

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: invalidUser.id }, invalidUser, { new: true })
                    .chain('exec')
                    .rejects({ name: 'CastError' })

                return repo.update(invalidUser)
                    .catch((err: any) => {
                        assert.isNotNull(err)
                        assert.equal(err.message, 'The given ID is in invalid format.')
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
                    assert.isBoolean(isDeleted)
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
                        assert.isBoolean(isDeleted)
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
                        assert.isNotNull(err)
                        assert.equal(err.message, 'The given ID is in invalid format.')
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
    })

})
