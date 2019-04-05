import sinon from 'sinon'
import { assert } from 'chai'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { IIntegrationEventRepository } from '../../../src/application/port/integration.event.repository.interface'
import { IntegrationEventRepositoryMock } from '../../mocks/integration.event.repository.mock'
import { IConnectionFactory } from '../../../src/infrastructure/port/connection.factory.interface'
import { ConnectionFactoryRabbitmqMock } from '../../mocks/connection.factory.rabbitmq.mock'
import { ConnectionRabbitmqMock } from '../../mocks/connection.rabbitmq.mock'
import { IConnectionEventBus } from '../../../src/infrastructure/port/connection.event.bus.interface'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { IEventBus } from '../../../src/infrastructure/port/event.bus.interface'
import { EventBusRabbitmqMock } from '../../mocks/event.bus.rabbitmq.mock'
import { IInstitutionRepository } from '../../../src/application/port/institution.repository.interface'
import { InstitutionRepositoryMock } from '../../mocks/institution.repository.mock'
import { ILogger } from '../../../src/utils/custom.logger'
import { IFamilyRepository } from '../../../src/application/port/family.repository.interface'
import { FamilyRepositoryMock } from '../../mocks/family.repository.mock'
import { IChildRepository } from '../../../src/application/port/child.repository.interface'
import { ChildRepositoryMock } from '../../mocks/child.repository.mock'
import { User } from '../../../src/application/domain/model/user'
import { UserMock } from '../../mocks/user.mock'
import { IUserService } from '../../../src/application/port/user.service.interface'
import { UserService } from '../../../src/application/service/user.service'
import { IUserRepository } from '../../../src/application/port/user.repository.interface'
import { UserRepositoryMock } from '../../mocks/user.repository.mock'
import { IEducatorRepository } from '../../../src/application/port/educator.repository.interface'
import { EducatorRepositoryMock } from '../../mocks/educator.repository.mock'
import { IHealthProfessionalRepository } from '../../../src/application/port/health.professional.repository.interface'
import { HealthProfessionalRepositoryMock } from '../../mocks/health.professional.repository.mock'
import { IEducatorService } from '../../../src/application/port/educator.service.interface'
import { EducatorService } from '../../../src/application/service/educator.service'
import { IChildrenGroupService } from '../../../src/application/port/children.group.service.interface'
import { ChildrenGroupService } from '../../../src/application/service/children.group.service'
import { IChildrenGroupRepository } from '../../../src/application/port/children.group.repository.interface'
import { ChildrenGroupRepositoryMock } from '../../mocks/children.group.repository.mock'
import { IChildService } from '../../../src/application/port/child.service.interface'
import { ChildService } from '../../../src/application/service/child.service'
import { IHealthProfessionalService } from '../../../src/application/port/health.professional.service.interface'
import { HealthProfessionalService } from '../../../src/application/service/health.professional.service'
import { IFamilyService } from '../../../src/application/port/family.service.interface'
import { FamilyService } from '../../../src/application/service/family.service'
import { IApplicationService } from '../../../src/application/port/application.service.interface'
import { ApplicationService } from '../../../src/application/service/application.service'
import { IApplicationRepository } from '../../../src/application/port/application.repository.interface'
import { ApplicationRepositoryMock } from '../../mocks/application.repository.mock'
import { Strings } from '../../../src/utils/strings'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'

require('sinon-mongoose')

describe('Services: User', () => {
    const user: User = new UserMock()
    user.password = 'user_password'

    const incorrectUser: User = new User()
    incorrectUser.type = ''

    // Mock family array
    const usersArr: Array<User> = new Array<UserMock>()
    for (let i = 0; i < 3; i++) {
        usersArr.push(new UserMock())
    }

    const modelFake: any = UserRepoModel

    // Mock repo
    const applicationRepo: IApplicationRepository = new ApplicationRepositoryMock()
    const childRepo: IChildRepository = new ChildRepositoryMock()
    const childrenGroupRepo: IChildrenGroupRepository = new ChildrenGroupRepositoryMock()
    const educatorRepo: IEducatorRepository = new EducatorRepositoryMock()
    const familyRepo: IFamilyRepository = new FamilyRepositoryMock()
    const healthProfessionalRepo: IHealthProfessionalRepository = new HealthProfessionalRepositoryMock()
    const institutionRepo: IInstitutionRepository = new InstitutionRepositoryMock()
    const integrationRepo: IIntegrationEventRepository = new IntegrationEventRepositoryMock()
    const userRepo: IUserRepository = new UserRepositoryMock()

    // Mock utils
    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitmqMock()
    const connectionRabbitmqPub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const connectionRabbitmqSub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const eventBusRabbitmq: IEventBus = new EventBusRabbitmqMock(connectionRabbitmqPub, connectionRabbitmqSub)
    const customLogger: ILogger = new CustomLoggerMock()

    // Mock services
    const applicationService: IApplicationService = new ApplicationService(applicationRepo, institutionRepo,
        integrationRepo, customLogger, eventBusRabbitmq)
    const childService: IChildService = new ChildService(childRepo, institutionRepo, childrenGroupRepo, familyRepo,
        integrationRepo, eventBusRabbitmq, customLogger)
    const childrenGroupService: IChildrenGroupService = new ChildrenGroupService(childrenGroupRepo, childRepo, customLogger)
    const educatorService: IEducatorService = new EducatorService(educatorRepo, institutionRepo, childrenGroupRepo,
        childrenGroupService, integrationRepo, eventBusRabbitmq, customLogger)
    const familyService: IFamilyService = new FamilyService(familyRepo, childRepo, institutionRepo, integrationRepo,
        eventBusRabbitmq, customLogger)
    const healthProfessionalService: IHealthProfessionalService = new HealthProfessionalService(healthProfessionalRepo,
        institutionRepo, childrenGroupService, childrenGroupRepo, integrationRepo, eventBusRabbitmq, customLogger)

    const userService: IUserService = new UserService(userRepo, educatorService, childService, healthProfessionalService,
        familyService, applicationService, integrationRepo, eventBusRabbitmq, customLogger)

    afterEach(() => {
        sinon.restore()
    })

    /**
     * Method "changePassword(userId: string, oldPassword: string, newPassword: string)"
     */
    describe('changePassword(userId: string, oldPassword: string, newPassword: string)', () => {
        context('when the parameters are correct', () => {
            it('should return true', () => {
                return userService.changePassword(user.id!, user.password!, user.password!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when the user id is invalid', () => {
            it('should throw a ValidationException', () => {
                user.id = '507f1f77bcf86cd7994390111'
                return userService.changePassword(user.id!, user.password!, user.password!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the "oldPassword" and "newPassword" parameters are missing', () => {
            it('should throw a ValidationException', () => {
                user.id = '507f1f77bcf86cd799439011'
                return userService.changePassword(user.id!, '', '')
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Change password validation failed: old_password, ' +
                            'new_password is required!')
                    })
            })
        })
    })

    /**
     * Method "getAll(query: IQuery)"
     */
    describe('getAll(query: IQuery)', () => {
        context('when there is at least one user object in the database that matches the query filters', () => {
            it('should return an User array', () => {
                const query: IQuery = new Query()
                query.filters = { _id: user.id }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(usersArr)

                return userService.getAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no user object in the database that matches the query filters', () => {
            it('should return an empty array', () => {
                user.id = '507f1f77bcf86cd799439012'         // Make mock return an empty array
                const query: IQuery = new Query()
                query.filters = { _id: user.id }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(new Array<UserMock>())

                return userService.getAll(query)
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
        context('when there is an user with the received parameters', () => {
            it('should return the User that was found', () => {
                user.id = '507f1f77bcf86cd799439011'         // Make mock return a Family
                const query: IQuery = new Query()
                query.filters = { _id: user.id }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(user)

                return userService.getById(user.id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no user with the received parameters', () => {
            it('should return undefined', () => {
                user.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                const query: IQuery = new Query()
                query.filters = { _id: user.id }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(undefined)

                return userService.getById(user.id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the family id is invalid', () => {
            it('should throw a ValidationException', () => {
                incorrectUser.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception
                const query: IQuery = new Query()
                query.filters = { _id: incorrectUser.id }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return userService.getById(incorrectUser.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "remove(id: string)"
     */
    describe('remove(id: string)', () => {
        context('when there is User (APPLICATION) with the received parameter', () => {
            it('should return true', () => {
                user.id = '507f1f77bcf86cd799439011'         // Make mock return true (APPLICATION)
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(user.id)
                    .chain('exec')
                    .resolves(true)

                return userService.remove(user.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is User (CHILD) with the received parameter', () => {
            it('should return true', () => {
                user.id = '507f1f77bcf86cd799439012'         // Make mock return true (CHILD)
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(user.id)
                    .chain('exec')
                    .resolves(true)

                return userService.remove(user.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is User (EDUCATOR) with the received parameter', () => {
            it('should return true', () => {
                user.id = '507f1f77bcf86cd799439013'         // Make mock return true (EDUCATOR)
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(user.id)
                    .chain('exec')
                    .resolves(true)

                return userService.remove(user.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is User (FAMILY) with the received parameter', () => {
            it('should return true', () => {
                user.id = '507f1f77bcf86cd799439014'         // Make mock return true (FAMILY)
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(user.id)
                    .chain('exec')
                    .resolves(true)

                return userService.remove(user.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is User (HEALTH_PROFESSIONAL) with the received parameter', () => {
            it('should return true', () => {
                user.id = '507f1f77bcf86cd799439015'         // Make mock return true (HEALTH_PROFESSIONAL)
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(user.id)
                    .chain('exec')
                    .resolves(true)

                return userService.remove(user.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is User (HEALTH_PROFESSIONAL) with the received parameter but there is no connection to the ' +
            'RabbitMQ to publish an event reporting the removal of the resource', () => {
            it('should return true and save the event to inform the removal of the resource', () => {
                connectionRabbitmqPub.isConnected = false
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(user.id)
                    .chain('exec')
                    .resolves(true)

                return userService.remove(user.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no User with the received parameter', () => {
            it('should return false', () => {
                user.id = '507f1f77bcf86cd799439016'         // Make mock return false
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(user.id)
                    .chain('exec')
                    .resolves(false)

                return userService.remove(user.id!)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when the user id is invalid', () => {
            it('should throw a ValidationException', () => {
                incorrectUser.id = '507f1f77bcf86cd7994390111'       // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(incorrectUser.id)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return userService.remove(incorrectUser.id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})
