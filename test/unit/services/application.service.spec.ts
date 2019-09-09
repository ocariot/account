import { assert } from 'chai'
import { Application } from '../../../src/application/domain/model/application'
import { ApplicationMock } from '../../mocks/application.mock'
import { IConnectionFactory } from '../../../src/infrastructure/port/connection.factory.interface'
import { ConnectionFactoryRabbitMQMock } from '../../mocks/connection.factory.rabbitmq.mock'
import { IApplicationRepository } from '../../../src/application/port/application.repository.interface'
import { IApplicationService } from '../../../src/application/port/application.service.interface'
import { ApplicationService } from '../../../src/application/service/application.service'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { RabbitMQMock } from '../../mocks/rabbitmq.mock'
import { IInstitutionRepository } from '../../../src/application/port/institution.repository.interface'
import { ApplicationRepositoryMock } from '../../mocks/application.repository.mock'
import { InstitutionRepositoryMock } from '../../mocks/institution.repository.mock'
import { ILogger } from '../../../src/utils/custom.logger'
import { InstitutionMock } from '../../mocks/institution.mock'
import { Strings } from '../../../src/utils/strings'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { UserType } from '../../../src/application/domain/model/user'
import { Default } from '../../../src/utils/default'

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

    const applicationRepo: IApplicationRepository = new ApplicationRepositoryMock()
    const institutionRepo: IInstitutionRepository = new InstitutionRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitMQMock()
    const rabbitmq: IEventBus = new RabbitMQMock(connectionFactoryRabbitmq)
    const customLogger: ILogger = new CustomLoggerMock()

    const applicationService: IApplicationService = new ApplicationService(applicationRepo, institutionRepo,
        rabbitmq, customLogger)

    before(async () => {
        try {
            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI, { sslOptions: { ca: [] } })
        } catch (err) {
            throw new Error('Failure on ApplicationService unit test: ' + err.message)
        }
    })

    /**
     * Method "add(application: Application)"
     */
    describe('add(application: Application)', () => {
        context('when the Application is correct and it still does not exist in the repository', () => {
            it('should return the Application that was added', () => {
                application.institution!.id = '507f1f77bcf86cd799439011'      // Make mock return true for the institution exists

                return applicationService.add(application)
                    .then(result => {
                        assert.propertyVal(result, 'id', application.id)
                        assert.propertyVal(result, 'username', application.username)
                        assert.propertyVal(result, 'password', application.password)
                        assert.propertyVal(result, 'type', application.type)
                        assert.propertyVal(result, 'scopes', application.scopes)
                        assert.propertyVal(result, 'institution', application.institution)
                        assert.propertyVal(result, 'application_name', application.application_name)
                        assert.propertyVal(result, 'last_login', application.last_login)
                    })
            })
        })

        context('when the Application is correct, does not have institution and still does not exist in the repository', () => {
            it('should return the Application that was added', () => {
                application.institution = undefined     // Make mock return true for the institution exists

                return applicationService.add(application)
                    .then(result => {
                        assert.propertyVal(result, 'id', application.id)
                        assert.propertyVal(result, 'username', application.username)
                        assert.propertyVal(result, 'password', application.password)
                        assert.propertyVal(result, 'type', application.type)
                        assert.propertyVal(result, 'scopes', application.scopes)
                        assert.propertyVal(result, 'institution', application.institution)
                        assert.propertyVal(result, 'application_name', application.application_name)
                        assert.propertyVal(result, 'last_login', application.last_login)
                    })
            })
        })

        context('when the Application is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                application.institution = new InstitutionMock()
                application.id = '507f1f77bcf86cd799439011'        // Make mock throw an exception

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

                return applicationService.add(application)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.INSTITUTION.ALERT_REGISTER_REQUIRED)
                    })
            })
        })

        context('when the Application is incorrect (missing application fields)', () => {
            it('should throw a ValidationException', () => {
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

                return applicationService.getById(incorrectApplication.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.APPLICATION.PARAM_ID_NOT_VALID_FORMAT)
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

                return applicationService.update(application)
                    .then(result => {
                        assert.propertyVal(result, 'id', application.id)
                        assert.propertyVal(result, 'username', application.username)
                        assert.propertyVal(result, 'password', application.password)
                        assert.propertyVal(result, 'type', application.type)
                        assert.propertyVal(result, 'scopes', application.scopes)
                        assert.propertyVal(result, 'institution', application.institution)
                        assert.propertyVal(result, 'application_name', application.application_name)
                        assert.propertyVal(result, 'last_login', application.last_login)
                    })
            })
        })

        context('when the Application does not exist in the database', () => {
            it('should return undefined', () => {
                application.id = '507f1f77bcf86cd799439013'         // Make mock return undefined

                return applicationService.update(application)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the Application is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
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

                return applicationService.update(application)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'This parameter could not be updated.')
                        assert.propertyVal(err, 'description', 'A specific route to update user password already exists.' +
                            'Access: PATCH /users/507f1f77bcf86cd799439013/password to update your password.')
                    })
            })
        })

        context('when the Application is incorrect (the institution is not registered)', () => {
            it('should throw a ValidationException', () => {
                application.password = ''
                application.institution!.id = '507f1f77bcf86cd799439012'

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

                return applicationService.remove(application.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no Application with the received parameter', () => {
            it('should return false', () => {
                application.id = '507f1f77bcf86cd799439013'         // Make mock return false

                return applicationService.remove(application.id)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when the Application is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
                incorrectApplication.id = '507f1f77bcf86cd7994390111'       // Make mock throw an exception

                return applicationService.remove(incorrectApplication.id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.APPLICATION.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('count()', () => {
        context('when want count applications', () => {
            it('should return the number of applications', () => {
                return applicationService.count()
                    .then(res => {
                        assert.equal(res, 1)
                    })
            })
        })
    })
})
