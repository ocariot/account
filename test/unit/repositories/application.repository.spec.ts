import sinon from 'sinon'
import { assert } from 'chai'
import { ApplicationRepository } from '../../../src/infrastructure/repository/application.repository'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { IApplicationRepository } from '../../../src/application/port/application.repository.interface'
import { Application } from '../../../src/application/domain/model/application'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { UserType } from '../../../src/application/domain/model/user'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { ObjectID } from 'bson'
import { ApplicationMock } from '../../mocks/application.mock'

require('sinon-mongoose')

describe('Repositories: Application', () => {
    const defaultApplication: Application = new ApplicationMock()
    defaultApplication.id = '507f1f77bcf86cd799439011'
    defaultApplication.password = 'mysecretkey'

    // Mock application array
    const applicationsArr: Array<Application> = new Array<ApplicationMock>()
    for (let i = 0; i < 3; i++) {
        applicationsArr.push(new ApplicationMock())
    }

    const modelFake: any = UserRepoModel
    const userRepo = new UserRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())
    const applicationRepo: IApplicationRepository =
        new ApplicationRepository(modelFake, new EntityMapperMock(), userRepo, new CustomLoggerMock())

    // Query mock
    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: { _id: defaultApplication.id, type: UserType.APPLICATION }
            }
        }
    }

    afterEach(() => {
        sinon.restore()
    })

    describe('create(item: Application)', () => {
        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(defaultApplication)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return applicationRepo.create(defaultApplication)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('find(query: IQuery)', () => {
        context('when there is at least one application that corresponds to the received parameters', () => {
            it('should return an Application array', () => {

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(applicationsArr)

                return applicationRepo.find(queryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is at least one application that corresponds to the received parameters (with a parameter to the ' +
            'populate (fields)', () => {
            it('should return an Application array', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: { 'institution.id': defaultApplication.institution!.id },
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: defaultApplication.id, type: UserType.APPLICATION }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(applicationsArr)

                return applicationRepo.find(customQueryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no application that corresponds to the received parameters', () => {
            it('should return an empty array', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012', type: UserType.APPLICATION }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(new Array<ApplicationMock>())

                return applicationRepo.find(queryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: '123', type: UserType.APPLICATION }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return applicationRepo.find(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findOne(query: IQuery)', () => {
        context('when there is a application that corresponds to the received parameters', () => {
            it('should return the Application that was found', () => {
                queryMock.filters = { _id: defaultApplication, type: UserType.APPLICATION }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultApplication)

                return applicationRepo.findOne(queryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultApplication.id)
                        assert.propertyVal(result, 'username', defaultApplication.username)
                        assert.propertyVal(result, 'type', defaultApplication.type)
                        assert.propertyVal(result, 'scopes', defaultApplication.scopes)
                        assert.propertyVal(result, 'institution', defaultApplication.institution)
                        assert.propertyVal(result, 'application_name', defaultApplication.application_name)
                    })
            })
        })

        context('when there is a application that corresponds to the received parameters (with a parameter to the ' +
            'populate (fields))', () => {
            it('should return the Application that was found', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: { 'institution.id': defaultApplication.institution!.id },
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: defaultApplication.id, type: UserType.APPLICATION }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultApplication)

                return applicationRepo.findOne(customQueryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultApplication.id)
                        assert.propertyVal(result, 'username', defaultApplication.username)
                        assert.propertyVal(result, 'type', defaultApplication.type)
                        assert.propertyVal(result, 'scopes', defaultApplication.scopes)
                        assert.propertyVal(result, 'institution', defaultApplication.institution)
                        assert.propertyVal(result, 'application_name', defaultApplication.application_name)
                    })
            })
        })

        context('when there is a application that corresponds to the received parameters (with a parameter to the ' +
            'populate (filters))', () => {
            it('should return the Application that was found', () => {
                queryMock.filters = { '_id': defaultApplication.id, 'type': UserType.APPLICATION,
                                      'institution.id': defaultApplication.institution!.id }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultApplication)

                return applicationRepo.findOne(queryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultApplication.id)
                        assert.propertyVal(result, 'username', defaultApplication.username)
                        assert.propertyVal(result, 'type', defaultApplication.type)
                        assert.propertyVal(result, 'scopes', defaultApplication.scopes)
                        assert.propertyVal(result, 'institution', defaultApplication.institution)
                        assert.propertyVal(result, 'application_name', defaultApplication.application_name)
                    })
            })
        })

        context('when there is no application that corresponds to the received parameters', () => {
            it('should return undefined', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012', type: UserType.APPLICATION }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return applicationRepo.findOne(queryMock)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: '123', type: UserType.APPLICATION }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return applicationRepo.findOne(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('update(item: Application)', () => {
        context('when the application exists in the database', () => {
            it('should return the updated application', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultApplication.id }, defaultApplication, { new: true })
                    .chain('exec')
                    .resolves(defaultApplication)

                return applicationRepo.update(defaultApplication)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultApplication.id)
                        assert.propertyVal(result, 'username', defaultApplication.username)
                        assert.propertyVal(result, 'type', defaultApplication.type)
                        assert.propertyVal(result, 'scopes', defaultApplication.scopes)
                        assert.propertyVal(result, 'institution', defaultApplication.institution)
                        assert.propertyVal(result, 'application_name', defaultApplication.application_name)
                    })
            })
        })

        context('when the application is not found', () => {
            it('should return undefined', () => {

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultApplication.id }, defaultApplication, { new: true })
                    .chain('exec')
                    .resolves(undefined)

                return applicationRepo.update(defaultApplication)
                    .then((result: any) => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {

                defaultApplication.id = '5b4b'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultApplication.id }, defaultApplication, { new: true })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return applicationRepo.update(defaultApplication)
                    .catch((err) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('checkExists()', () => {
        context('when there is an application with the search filters used', () => {
            it('should return true if exists in search by id', () => {
                defaultApplication.id = '507f1f77bcf86cd799439011'
                queryMock.filters = { _id: defaultApplication.id, type: UserType.APPLICATION }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(true)

                return applicationRepo.checkExist(defaultApplication)
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
                            filters: { username: defaultApplication.username, type: UserType.APPLICATION }
                        }
                    }
                }

                const appWithoutId = new Application()
                appWithoutId.username = defaultApplication.username
                appWithoutId.type = defaultApplication.type

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(true)

                return applicationRepo.checkExist(appWithoutId)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when application is not found', () => {
            it('should return false', () => {
                const customApp = new Application()
                customApp.id = `${new ObjectID()}`
                customApp.type = UserType.APPLICATION

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: customApp.id, type: UserType.APPLICATION }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(false)

                return applicationRepo.checkExist(customApp)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultApplication.id = ''
                queryMock.filters = { _id: defaultApplication.id, type: UserType.APPLICATION }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return applicationRepo.checkExist(defaultApplication)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
