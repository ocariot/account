import sinon from 'sinon'
import { assert } from 'chai'
import { Application } from '../../../src/application/domain/model/application'
import { ApplicationMock } from '../../mocks/application.mock'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { IIntegrationEventRepository } from '../../../src/application/port/integration.event.repository.interface'
import { IntegrationEventRepositoryMock } from '../../mocks/integration.event.repository.mock'
import { IConnectionFactory } from '../../../src/infrastructure/port/connection.factory.interface'
import { ConnectionFactoryRabbitmqMock } from '../../mocks/connection.factory.rabbitmq.mock'
import { ConnectionRabbitmqMock } from '../../mocks/connection.rabbitmq.mock'
import { IConnectionEventBus } from '../../../src/infrastructure/port/connection.event.bus.interface'
import { IApplicationRepository } from '../../../src/application/port/application.repository.interface'
import { IApplicationService } from '../../../src/application/port/application.service.interface'
import { ApplicationService } from '../../../src/application/service/application.service'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { IEventBus } from '../../../src/infrastructure/port/event.bus.interface'
import { EventBusRabbitmqMock } from '../../mocks/event.bus.rabbitmq.mock'
import { IInstitutionRepository } from '../../../src/application/port/institution.repository.interface'
import { ApplicationRepositoryMock } from '../../mocks/application.repository.mock'
import { InstitutionRepositoryMock } from '../../mocks/institution.repository.mock'
import { ILogger } from '../../../src/utils/custom.logger'
import { InstitutionMock } from '../../mocks/institution.mock'
import { Strings } from '../../../src/utils/strings'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { UserType } from '../../../src/application/domain/model/user'

require('sinon-mongoose')

describe('Services: Application', () => {
    const application: Application = new ApplicationMock()
    application.password = 'application_password'
    application.institution = new InstitutionMock()
    application.institution.id = '507f1f77bcf86cd799439011'

    const incorrectApplication: Application = new Application()
    incorrectApplication.type = ''

    // Mock application array
    const applicationsArr: Array<Application> = new Array<ApplicationMock>()
    for (let i = 0; i < 3; i++) {
        applicationsArr.push(new ApplicationMock())
    }

    const modelFake: any = UserRepoModel
    const applicationRepo: IApplicationRepository = new ApplicationRepositoryMock()
    const institutionRepo: IInstitutionRepository = new InstitutionRepositoryMock()
    const integrationRepo: IIntegrationEventRepository = new IntegrationEventRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitmqMock()
    const connectionRabbitmqPub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const connectionRabbitmqSub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const eventBusRabbitmq: IEventBus = new EventBusRabbitmqMock(connectionRabbitmqPub, connectionRabbitmqSub)
    const customLogger: ILogger = new CustomLoggerMock()

    const applicationService: IApplicationService = new ApplicationService(applicationRepo, institutionRepo,
        integrationRepo, customLogger, eventBusRabbitmq)

    afterEach(() => {
        sinon.restore()
    })

    /**
     * Method "add(application: Application)"
     */
    describe('add(application: Application)', () => {
        context('when the Application is correct and it still does not exist in the repository', () => {
            it('should return the Application that was added', () => {
                application.institution!.id = '507f1f77bcf86cd799439011'      // Make mock return true for the institution exists
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(application)
                    .chain('exec')
                    .resolves(application)

                return applicationService.add(application)
                    .then(result => {
                        assert.propertyVal(result, 'id', application.id)
                        assert.propertyVal(result, 'username', application.username)
                        assert.propertyVal(result, 'password', application.password)
                        assert.propertyVal(result, 'type', application.type)
                        assert.propertyVal(result, 'scopes', application.scopes)
                        assert.propertyVal(result, 'institution', application.institution)
                        assert.propertyVal(result, 'application_name', application.application_name)
                    })
            })
        })

        context('when the Application is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                application.id = '507f1f77bcf86cd799439011'        // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(application)
                    .chain('exec')
                    .rejects({ message: Strings.APPLICATION.ALREADY_REGISTERED})

                return applicationService.add(application)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.APPLICATION.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the Application is correct and it still does not exist in the repository but the institution is not ' +
            'registered', () => {
            it('should throw a ValidationException', () => {
                application.id = '507f1f77bcf86cd799439012'
                application.institution!.id = '507f1f77bcf86cd799439012'      // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(application)
                    .chain('exec')
                    .rejects({ message: Strings.INSTITUTION.REGISTER_REQUIRED,
                               description: Strings.INSTITUTION.ALERT_REGISTER_REQUIRED })

                return applicationService.add(application)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.INSTITUTION.ALERT_REGISTER_REQUIRED)
                    })
            })
        })

        context('when the Application is incorrect (missing application fields)', () => {
            it('should throw a ValidationException', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectApplication)
                    .chain('exec')
                    .rejects({ message: 'Required fields were not provided...',
                               description: 'Application validation: username, password, type, application_name is required!' })

                return applicationService.add(incorrectApplication)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Application validation: username, password, type, ' +
                            'application_name is required!')
                    })
            })
        })

        context('when the Application is incorrect (the institution id is invalid)', () => {
            it('should throw a ValidationException', () => {
                application.institution!.id = '507f1f77bcf86cd7994390111'
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(application)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return applicationService.add(application)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "getAll(query: IQuery)"
     */
    describe('getAll(query: IQuery)', () => {
        context('when there is at least one application object in the database that matches the query filters', () => {
            it('should return an Application array', () => {
                application.institution!.id = '507f1f77bcf86cd799439011'
                application.id = '507f1f77bcf86cd799439011'     // Make mock return a filled array
                const query: IQuery = new Query()
                query.filters = { _id: application.id, type: UserType.APPLICATION }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(applicationsArr)

                return applicationService.getAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no application object in the database that matches the query filters', () => {
            it('should return an empty array', () => {
                application.id = '507f1f77bcf86cd799439012'         // Make mock return an empty array
                const query: IQuery = new Query()
                query.filters = { _id: application.id, type: UserType.APPLICATION }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(new Array<ApplicationMock>())

                return applicationService.getAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })
    })

    /**
     * Method "getById(id: string, query: IQuery)"
     */
    describe('getById(id: string, query: IQuery)', () => {
        context('when there is an application with the received parameters', () => {
            it('should return the Application that was found', () => {
                application.id = '507f1f77bcf86cd799439011'         // Make mock return an application
                const query: IQuery = new Query()
                query.filters = { _id: application.id, type: UserType.APPLICATION }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(application)

                return applicationService.getById(application.id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no application with the received parameters', () => {
            it('should return undefined', () => {
                application.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                const query: IQuery = new Query()
                query.filters = { _id: application.id, type: UserType.APPLICATION }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(undefined)

                return applicationService.getById(application.id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the application id is invalid', () => {
            it('should throw a ValidationException', () => {
                incorrectApplication.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception
                const query: IQuery = new Query()
                query.filters = { _id: incorrectApplication.id, type: UserType.APPLICATION }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return applicationService.getById(incorrectApplication.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "update(application: Application)"
     */
    describe('update(application: Application)', () => {
        context('when the Application exists in the database', () => {
            it('should return the Application that was updated', () => {
                application.password = ''
                application.id = '507f1f77bcf86cd799439011'         // Make mock return an updated Application
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(application)
                    .chain('exec')
                    .resolves(application)

                return applicationService.update(application)
                    .then(result => {
                        assert.propertyVal(result, 'id', application.id)
                        assert.propertyVal(result, 'username', application.username)
                        assert.propertyVal(result, 'password', application.password)
                        assert.propertyVal(result, 'type', application.type)
                        assert.propertyVal(result, 'scopes', application.scopes)
                        assert.propertyVal(result, 'institution', application.institution)
                        assert.propertyVal(result, 'application_name', application.application_name)
                    })
            })
        })

        context('when the Application exists in the database but there is no connection to the RabbitMQ', () => {
            it('should return the Application that was saved', () => {
                connectionRabbitmqPub.isConnected = false
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(application)
                    .chain('exec')
                    .resolves(application)

                return applicationService.update(application)
                    .then(result => {
                        assert.propertyVal(result, 'id', application.id)
                        assert.propertyVal(result, 'username', application.username)
                        assert.propertyVal(result, 'password', application.password)
                        assert.propertyVal(result, 'type', application.type)
                        assert.propertyVal(result, 'scopes', application.scopes)
                        assert.propertyVal(result, 'institution', application.institution)
                        assert.propertyVal(result, 'application_name', application.application_name)
                    })
            })
        })

        context('when the Application does not exist in the database', () => {
            it('should return undefined', () => {
                application.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(application)
                    .chain('exec')
                    .resolves(undefined)

                return applicationService.update(application)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the Application is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectApplication)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return applicationService.update(incorrectApplication)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Application is incorrect (invalid institution id)', () => {
            it('should throw a ValidationException', () => {
                incorrectApplication.id = '507f1f77bcf86cd799439011'
                incorrectApplication.institution = new InstitutionMock()
                incorrectApplication.institution!.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectApplication)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return applicationService.update(incorrectApplication)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Application is incorrect (attempt to update password)', () => {
            it('should throw a ValidationException', () => {
                application.password = 'application_password'
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(application)
                    .chain('exec')
                    .rejects({ message: 'This parameter could not be updated.',
                               description: 'A specific route to update user password already exists.' +
                                   'Access: PATCH /users/507f1f77bcf86cd799439012/password to update your password.' })

                return applicationService.update(application)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'This parameter could not be updated.')
                        assert.propertyVal(err, 'description', 'A specific route to update user password already exists.' +
                            'Access: PATCH /users/507f1f77bcf86cd799439012/password to update your password.')
                    })
            })
        })

        context('when the Application is incorrect (the institution is not registered)', () => {
            it('should throw a ValidationException', () => {
                application.password = ''
                application.institution!.id = '507f1f77bcf86cd799439012'
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(application)
                    .chain('exec')
                    .rejects({ message: Strings.INSTITUTION.REGISTER_REQUIRED,
                               description: Strings.INSTITUTION.ALERT_REGISTER_REQUIRED })

                return applicationService.update(application)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.INSTITUTION.ALERT_REGISTER_REQUIRED)
                    })
            })
        })
    })

    /**
     * Method "remove(id: string)"
     */
    describe('remove(id: string)', () => {
        context('when there is Application with the received parameter', () => {
            it('should return true', () => {
                application.id = '507f1f77bcf86cd799439011'         // Make mock return true
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(application.id)
                    .chain('exec')
                    .resolves(true)

                return applicationService.remove(application.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no Application with the received parameter', () => {
            it('should return false', () => {
                application.id = '507f1f77bcf86cd799439013'         // Make mock return false
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(application.id)
                    .chain('exec')
                    .resolves(false)

                return applicationService.remove(application.id)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when the Application is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
                incorrectApplication.id = '507f1f77bcf86cd7994390111'       // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(incorrectApplication.id)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return applicationService.remove(incorrectApplication.id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})
