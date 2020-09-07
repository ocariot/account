import sinon from 'sinon'
import { Child, FitbitStatus } from '../../../src/application/domain/model/child'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { ChildRepository } from '../../../src/infrastructure/repository/child.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'
import { ChildMock } from '../../mocks/child.mock'
import { assert } from 'chai'
import { UserType } from '../../../src/application/domain/model/user'
import { ObjectID } from 'bson'
import { Query } from '../../../src/infrastructure/repository/query/query'

require('sinon-mongoose')

describe('Repositories: Child', () => {
    const defaultChild: Child = new ChildMock()
    defaultChild.id = '507f1f77bcf86cd799439011'
    defaultChild.password = 'child_password'

    // Mock children array
    const childrenArr: Array<Child> = new Array<ChildMock>()
    for (let i = 0; i < 3; i++) {
        childrenArr.push(new ChildMock())
    }

    const modelFake: any = UserRepoModel
    const userRepo = new UserRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())
    const childRepo = new ChildRepository(modelFake, new EntityMapperMock(), userRepo, new CustomLoggerMock())

    // Mock query
    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: { _id: defaultChild.id, type: UserType.CHILD }
            }
        }
    }

    afterEach(() => {
        sinon.restore()
    })

    describe('create(item: Child)', () => {
        context('when the Child does not have password', () => {
            it('should return a Child without password', () => {
                defaultChild.password = undefined

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(defaultChild)
                    .resolves(defaultChild)
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ _id: defaultChild.id })
                    .chain('exec')
                    .resolves(defaultChild)

                return childRepo.create(defaultChild)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultChild.id)
                        assert.propertyVal(result, 'username', defaultChild.username)
                        assert.isUndefined(result.password)
                        assert.propertyVal(result, 'type', defaultChild.type)
                        assert.propertyVal(result, 'institution', defaultChild.institution)
                        assert.propertyVal(result, 'last_login', defaultChild.last_login)
                        assert.propertyVal(result, 'last_sync', defaultChild.last_sync)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultChild.password = 'child_password'

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(defaultChild)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return childRepo.create(defaultChild)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findAll(query: IQuery)', () => {
        const query: Query = new Query()
        query.ordination = new Map()
        context('when there is at least one child that corresponds to the received parameters', () => {
            it('should return an Child array', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('sort')
                    .withArgs({ created_at: -1 })
                    .chain('skip')
                    .withArgs(0)
                    .chain('limit')
                    .withArgs(query.pagination.limit)
                    .chain('exec')
                    .resolves(childrenArr)

                return childRepo.findAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no child that corresponds to the received parameters', () => {
            it('should return an empty array', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012', type: UserType.CHILD }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('sort')
                    .withArgs({ created_at: -1 })
                    .chain('skip')
                    .withArgs(0)
                    .chain('limit')
                    .withArgs(query.pagination.limit)
                    .chain('exec')
                    .resolves(new Array<ChildMock>())

                return childRepo.findAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: '', type: UserType.CHILD }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('sort')
                    .withArgs({ created_at: -1 })
                    .chain('skip')
                    .withArgs(0)
                    .chain('limit')
                    .withArgs(query.pagination.limit)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return childRepo.findAll(query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findOne(query: IQuery)', () => {
        context('when there is a child that corresponds to the received parameters', () => {
            it('should return the Child that was found', () => {
                queryMock.filters = { _id: defaultChild.id, type: UserType.CHILD }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultChild)

                return childRepo.findOne(queryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultChild.id)
                        assert.propertyVal(result, 'username', defaultChild.username)
                        assert.propertyVal(result, 'password', defaultChild.password)
                        assert.propertyVal(result, 'type', defaultChild.type)
                        assert.propertyVal(result, 'institution', defaultChild.institution)
                        assert.propertyVal(result, 'gender', defaultChild.gender)
                        assert.propertyVal(result, 'age', defaultChild.age)
                        assert.propertyVal(result, 'last_login', defaultChild.last_login)
                        assert.propertyVal(result, 'last_sync', defaultChild.last_sync)
                    })
            })
        })

        context('when there is a child that corresponds to the received parameters (with a parameter to the ' +
            'populate (filters))', () => {
            it('should return the Child that was found', () => {
                queryMock.filters = {
                    '_id': defaultChild.id, 'type': UserType.CHILD,
                    'institution.id': defaultChild.institution!.id
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultChild)

                return childRepo.findOne(queryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultChild.id)
                        assert.propertyVal(result, 'username', defaultChild.username)
                        assert.propertyVal(result, 'password', defaultChild.password)
                        assert.propertyVal(result, 'type', defaultChild.type)
                        assert.propertyVal(result, 'institution', defaultChild.institution)
                        assert.propertyVal(result, 'gender', defaultChild.gender)
                        assert.propertyVal(result, 'age', defaultChild.age)
                        assert.propertyVal(result, 'last_login', defaultChild.last_login)
                        assert.propertyVal(result, 'last_sync', defaultChild.last_sync)
                    })
            })
        })

        context('when there is no child that corresponds to the received parameters', () => {
            it('should return undefined', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012', type: UserType.CHILD }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return childRepo.findOne(queryMock)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: '', type: UserType.CHILD }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return childRepo.findOne(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('update(item: Child)', () => {
        context('when the child exists in the database', () => {
            it('should return the updated child', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultChild.id }, defaultChild, { new: true })
                    .chain('exec')
                    .resolves(defaultChild)

                return childRepo.update(defaultChild)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultChild.id)
                        assert.propertyVal(result, 'username', defaultChild.username)
                        assert.propertyVal(result, 'password', defaultChild.password)
                        assert.propertyVal(result, 'type', defaultChild.type)
                        assert.propertyVal(result, 'institution', defaultChild.institution)
                        assert.propertyVal(result, 'gender', defaultChild.gender)
                        assert.propertyVal(result, 'age', defaultChild.age)
                        assert.propertyVal(result, 'last_login', defaultChild.last_login)
                        assert.propertyVal(result, 'last_sync', defaultChild.last_sync)
                    })
            })
        })

        context('when the child is not found', () => {
            it('should return undefined', () => {

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultChild.id }, defaultChild, { new: true })
                    .chain('exec')
                    .resolves(undefined)

                return childRepo.update(defaultChild)
                    .then((result: any) => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {

                defaultChild.id = ''

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultChild.id }, defaultChild, { new: true })
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return childRepo.update(defaultChild)
                    .catch((err) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('checkExists()', () => {
        const childWithoutId = new Child()
        childWithoutId.username = defaultChild.username
        childWithoutId.type = defaultChild.type

        context('when there is a child with the search filters used', () => {
            it('should return true if exists in search by id', () => {
                defaultChild.id = '507f1f77bcf86cd799439011'
                queryMock.filters = { _id: defaultChild.id, type: UserType.CHILD }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves([defaultChild])

                return childRepo.checkExist(defaultChild)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the username is used as the search filter', () => {
            it('should return true if exists in search by username', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { type: UserType.CHILD }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves([childWithoutId])

                return childRepo.checkExist(childWithoutId)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when child is not found', () => {
            it('should return false', () => {
                const customChild = new Child()
                customChild.id = `${new ObjectID()}`
                customChild.type = UserType.CHILD

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: customChild.id, type: UserType.CHILD }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves([])

                return childRepo.checkExist(customChild)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when the parameter is an empty children array', () => {
            it('should return false', () => {
                queryMock.filters = { _id: defaultChild.id, type: UserType.CHILD }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultChild)

                return childRepo.checkExist([])
                    .then(result => {
                        assert.isFalse(result)

                    })
            })
        })

        context('when the parameter is a children array and a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: defaultChild.id, type: UserType.CHILD }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return childRepo.checkExist([defaultChild])
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: defaultChild.id, type: UserType.CHILD }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return childRepo.checkExist(defaultChild)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('count()', () => {
        context('when there is at least one child in the database', () => {
            it('should return how many children there are in the database', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .resolves(2)

                return childRepo.count()
                    .then((countChildren: number) => {
                        assert.equal(countChildren, 2)
                    })
            })
        })

        context('when there no are children in database', () => {
            it('should return 0', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .resolves(0)

                return childRepo.count()
                    .then((countChildren: number) => {
                        assert.equal(countChildren, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return childRepo.count()
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('updateFitbitStatus(childId: string, fitbitStatus: string)', () => {
        context('when the child exists in the database', () => {
            it('should return the updated child', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs()
                    .chain('exec')
                    .resolves(defaultChild)

                return childRepo.updateFitbitStatus(defaultChild.id!, FitbitStatus.INVALID_TOKEN)
                    .then((result: Child) => {
                        assert.propertyVal(result, 'id', defaultChild.id)
                        assert.propertyVal(result, 'username', defaultChild.username)
                        assert.propertyVal(result, 'password', defaultChild.password)
                        assert.propertyVal(result, 'type', defaultChild.type)
                        assert.propertyVal(result, 'institution', defaultChild.institution)
                        assert.propertyVal(result, 'gender', defaultChild.gender)
                        assert.propertyVal(result, 'age', defaultChild.age)
                        assert.propertyVal(result, 'last_login', defaultChild.last_login)
                        assert.propertyVal(result, 'last_sync', defaultChild.last_sync)
                        assert.propertyVal(result, 'fitbit_status', defaultChild.fitbit_status)
                    })
            })
        })

        context('when the child is not found', () => {
            it('should return undefined', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs()
                    .chain('exec')
                    .resolves(undefined)

                return childRepo.updateFitbitStatus(defaultChild.id!, FitbitStatus.VALID_TOKEN)
                    .then((result: Child) => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs()
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return childRepo.updateFitbitStatus(defaultChild.id!, FitbitStatus.VALID_TOKEN)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('updateLastSync(childId: string, lastSync: Date)', () => {
        context('when the child exists in the database', () => {
            it('should return the updated child', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs()
                    .chain('exec')
                    .resolves(defaultChild)

                return childRepo.updateLastSync(defaultChild.id!, defaultChild.last_sync!)
                    .then((result: Child) => {
                        assert.propertyVal(result, 'id', defaultChild.id)
                        assert.propertyVal(result, 'username', defaultChild.username)
                        assert.propertyVal(result, 'password', defaultChild.password)
                        assert.propertyVal(result, 'type', defaultChild.type)
                        assert.propertyVal(result, 'institution', defaultChild.institution)
                        assert.propertyVal(result, 'gender', defaultChild.gender)
                        assert.propertyVal(result, 'age', defaultChild.age)
                        assert.propertyVal(result, 'last_login', defaultChild.last_login)
                        assert.propertyVal(result, 'last_sync', defaultChild.last_sync)
                        assert.propertyVal(result, 'fitbit_status', defaultChild.fitbit_status)
                    })
            })
        })

        context('when the child is not found', () => {
            it('should return undefined', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs()
                    .chain('exec')
                    .resolves(undefined)

                return childRepo.updateLastSync(defaultChild.id!, new Date('2020-01-25T14:40:00Z'))
                    .then((result: Child) => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs()
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return childRepo.updateLastSync(defaultChild.id!, new Date('2020-01-25T14:40:00Z'))
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findByLastSync(numberOfDays: number)', () => {
        context('when there is at least one child in the database who synchronized their data up to 3 days ago',
            () => {
                it('should return how many children there are in the database with these characteristics',
                    () => {
                        sinon
                            .mock(modelFake)
                            .expects('find')
                            .withArgs()
                            .chain('exec')
                            .resolves([new ChildMock()])

                        return childRepo.findInactiveChildren(3)
                            .then((result: Array<Child>) => {
                                assert.equal(result.length, 1)
                            })
                    })
            })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs()
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return childRepo.findInactiveChildren(3)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
