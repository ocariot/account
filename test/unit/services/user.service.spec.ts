import { assert } from 'chai'
import { IConnectionFactory } from '../../../src/infrastructure/port/connection.factory.interface'
import { ConnectionFactoryRabbitMQMock } from '../../mocks/connection.factory.rabbitmq.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { RabbitMQMock } from '../../mocks/rabbitmq.mock'
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
import { Default } from '../../../src/utils/default'

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

    // Mock repo
    const applicationRepo: IApplicationRepository = new ApplicationRepositoryMock()
    const childRepo: IChildRepository = new ChildRepositoryMock()
    const childrenGroupRepo: IChildrenGroupRepository = new ChildrenGroupRepositoryMock()
    const educatorRepo: IEducatorRepository = new EducatorRepositoryMock()
    const familyRepo: IFamilyRepository = new FamilyRepositoryMock()
    const healthProfessionalRepo: IHealthProfessionalRepository = new HealthProfessionalRepositoryMock()
    const institutionRepo: IInstitutionRepository = new InstitutionRepositoryMock()
    const userRepo: IUserRepository = new UserRepositoryMock()

    // Mock utils
    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitMQMock()
    const rabbitmq: IEventBus = new RabbitMQMock(connectionFactoryRabbitmq)
    const customLogger: ILogger = new CustomLoggerMock()

    // Mock services
    const applicationService: IApplicationService = new ApplicationService(applicationRepo, institutionRepo,
        rabbitmq, customLogger)
    const childService: IChildService = new ChildService(childRepo, institutionRepo, childrenGroupRepo, familyRepo,
        rabbitmq, customLogger)
    const childrenGroupService: IChildrenGroupService = new ChildrenGroupService(childrenGroupRepo, childRepo, customLogger)
    const educatorService: IEducatorService = new EducatorService(educatorRepo, institutionRepo, childrenGroupRepo,
        childrenGroupService, rabbitmq, customLogger)
    const familyService: IFamilyService = new FamilyService(familyRepo, childRepo, institutionRepo, rabbitmq, customLogger)
    const healthProfessionalService: IHealthProfessionalService = new HealthProfessionalService(healthProfessionalRepo,
        institutionRepo, childrenGroupRepo, childrenGroupService, rabbitmq, customLogger)

    const userService: IUserService = new UserService(userRepo, educatorService, childService, healthProfessionalService,
        familyService, applicationService, rabbitmq, customLogger)

    before(async () => {
        try {
            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI, { sslOptions: { ca: [] } })
        } catch (err) {
            throw new Error('Failure on UserService unit test: ' + err.message)
        }
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
                        assert.propertyVal(err, 'message', Strings.USER.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the "oldPassword" and "newPassword" parameters are missing', () => {
            it('should throw a ValidationException', () => {
                user.id = '507f1f77bcf86cd799439011'
                return userService.changePassword(user.id!, undefined!, undefined!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Change password validation failed: old_password, ' +
                            'new_password is required!')
                    })
            })
        })
    })

    /**
     * Method "resetPassword(userId: string, newPassword: string)"
     */
    describe('resetPassword(userId: string, newPassword: string)', () => {
        context('when the parameters are correct', () => {
            it('should return true', () => {
                return userService.resetPassword(user.id!, user.password!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when the user id is invalid', () => {
            it('should throw a ValidationException', () => {
                user.id = '507f1f77bcf86cd7994390111'
                return userService.resetPassword(user.id!, user.password!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.USER.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the "oldPassword" and "newPassword" parameters are missing', () => {
            it('should throw a ValidationException', () => {
                user.id = '507f1f77bcf86cd799439011'
                return userService.resetPassword(user.id!, undefined!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required field not provided...')
                        assert.propertyVal(err, 'description', 'Reset password validation failed: ' +
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

                return userService.getById(incorrectUser.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.USER.PARAM_ID_NOT_VALID_FORMAT)
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

                return userService.remove(user.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is User (CHILD) with the received parameter', () => {
            it('should return true', () => {
                user.id = '507f1f77bcf86cd799439012'         // Make mock return true (CHILD)

                return userService.remove(user.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is User (EDUCATOR) with the received parameter', () => {
            it('should return true', () => {
                user.id = '507f1f77bcf86cd799439013'         // Make mock return true (EDUCATOR)

                return userService.remove(user.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is User (FAMILY) with the received parameter', () => {
            it('should return true', () => {
                user.id = '507f1f77bcf86cd799439014'         // Make mock return true (FAMILY)

                return userService.remove(user.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is User (HEALTH_PROFESSIONAL) with the received parameter', () => {
            it('should return true', () => {
                user.id = '507f1f77bcf86cd799439015'         // Make mock return true (HEALTH_PROFESSIONAL)

                return userService.remove(user.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no User with the received parameter', () => {
            it('should return false', () => {
                user.id = '507f1f77bcf86cd799439016'         // Make mock return false

                return userService.remove(user.id!)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when the user id is invalid', () => {
            it('should throw a ValidationException', () => {
                incorrectUser.id = '507f1f77bcf86cd7994390111'       // Make mock throw an exception

                return userService.remove(incorrectUser.id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.USER.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})
