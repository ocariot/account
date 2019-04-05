import sinon from 'sinon'
import { Child } from '../../../src/application/domain/model/child'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { ChildRepository } from '../../../src/infrastructure/repository/child.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'
import { ChildMock } from '../../mocks/child.mock'
import { assert } from 'chai'
import { UserType } from '../../../src/application/domain/model/user'

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
        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(defaultChild)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return childRepo.create(defaultChild)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('find(query: IQuery)', () => {
        context('when there is at least one child that corresponds to the received parameters', () => {
            it('should return an Child array', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(childrenArr)

                return childRepo.find(queryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is at least one child that corresponds to the received parameters (with a parameter to the ' +
            'populate (fields))', () => {
            it('should return an Child array', () => {
                queryMock.filters = { _id: defaultChild.id, type: UserType.CHILD }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(childrenArr)

                return childRepo.find(queryMock)
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
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(new Array<ChildMock>())

                return childRepo.find(queryMock)
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
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return childRepo.find(queryMock)
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
                        assert.propertyVal(result, 'scopes', defaultChild.scopes)
                        assert.propertyVal(result, 'institution', defaultChild.institution)
                        assert.propertyVal(result, 'gender', defaultChild.gender)
                        assert.propertyVal(result, 'age', defaultChild.age)
                    })
            })
        })

        context('when there is a child that corresponds to the received parameters (with a parameter to the ' +
            'populate (fields))', () => {
            it('should return the Child that was found', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: { 'institution.id': defaultChild.institution!.id },
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: defaultChild.id, type: UserType.CHILD }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultChild)

                return childRepo.findOne(customQueryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultChild.id)
                        assert.propertyVal(result, 'username', defaultChild.username)
                        assert.propertyVal(result, 'password', defaultChild.password)
                        assert.propertyVal(result, 'type', defaultChild.type)
                        assert.propertyVal(result, 'scopes', defaultChild.scopes)
                        assert.propertyVal(result, 'institution', defaultChild.institution)
                        assert.propertyVal(result, 'gender', defaultChild.gender)
                        assert.propertyVal(result, 'age', defaultChild.age)
                    })
            })
        })

        context('when there is a child that corresponds to the received parameters (with a parameter to the ' +
            'populate (filters))', () => {
            it('should return the Child that was found', () => {
                queryMock.filters = { '_id': defaultChild.id, 'type': UserType.CHILD,
                                'institution.id': defaultChild.institution!.id }

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
                        assert.propertyVal(result, 'scopes', defaultChild.scopes)
                        assert.propertyVal(result, 'institution', defaultChild.institution)
                        assert.propertyVal(result, 'gender', defaultChild.gender)
                        assert.propertyVal(result, 'age', defaultChild.age)
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
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

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
                        assert.propertyVal(result, 'scopes', defaultChild.scopes)
                        assert.propertyVal(result, 'institution', defaultChild.institution)
                        assert.propertyVal(result, 'gender', defaultChild.gender)
                        assert.propertyVal(result, 'age', defaultChild.age)
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
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return childRepo.update(defaultChild)
                    .catch((err) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('checkExists()', () => {
        context('when the username is used as the search filter', () => {
            it('should return true if exists in search by username', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { username: defaultChild.username, type: UserType.CHILD }
                        }
                    }
                }

                const childWithoutId = new Child()
                childWithoutId.username = defaultChild.username
                childWithoutId.type = defaultChild.type

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(true)

                return childRepo.checkExist(childWithoutId)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the parameter is an empty array', () => {
            it('should return false', () => {
                queryMock.filters = { username: defaultChild.username, type: UserType.CHILD }

                const childrenWithoutId: Array<Child> = new Array<Child>()

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(false)

                return childRepo.checkExist(childrenWithoutId)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultChild.id = ''
                queryMock.filters = { _id: defaultChild.id, type: UserType.CHILD }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return childRepo.checkExist(defaultChild)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
