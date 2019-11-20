import { assert } from 'chai'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { IInstitutionRepository } from '../../../src/application/port/institution.repository.interface'
import { InstitutionRepositoryMock } from '../../mocks/institution.repository.mock'
import { ILogger } from '../../../src/utils/custom.logger'
import { IChildRepository } from '../../../src/application/port/child.repository.interface'
import { ChildRepositoryMock } from '../../mocks/child.repository.mock'
import { IChildrenGroupRepository } from '../../../src/application/port/children.group.repository.interface'
import { ChildrenGroupRepositoryMock } from '../../mocks/children.group.repository.mock'
import { IConnectionFactory } from '../../../src/infrastructure/port/connection.factory.interface'
import { ConnectionFactoryRabbitMQMock } from '../../mocks/connection.factory.rabbitmq.mock'
import { RabbitMQMock } from '../../mocks/rabbitmq.mock'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { IChildrenGroupService } from '../../../src/application/port/children.group.service.interface'
import { ChildrenGroupService } from '../../../src/application/service/children.group.service'
import { Strings } from '../../../src/utils/strings'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { UserType } from '../../../src/application/domain/model/user'
import { InstitutionMock } from '../../mocks/institution.mock'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { ChildrenGroupMock } from '../../mocks/children.group.mock'
import { UserMock } from '../../mocks/user.mock'
import { Child } from '../../../src/application/domain/model/child'
import { IHealthProfessionalService } from '../../../src/application/port/health.professional.service.interface'
import { HealthProfessionalService } from '../../../src/application/service/health.professional.service'
import { IHealthProfessionalRepository } from '../../../src/application/port/health.professional.repository.interface'
import { HealthProfessionalRepositoryMock } from '../../mocks/health.professional.repository.mock'
import { HealthProfessional } from '../../../src/application/domain/model/health.professional'
import { HealthProfessionalMock } from '../../mocks/health.professional.mock'
import { Default } from '../../../src/utils/default'

describe('Services: HealthProfessional', () => {
    /**
     * Mock HealthProfessional
     */
    const healthProfessional: HealthProfessional = new HealthProfessionalMock()
    healthProfessional.password = 'health_professional_password'
    healthProfessional.institution!.id = '507f1f77bcf86cd799439011'

    const incorrectHealthProfessional: HealthProfessional = new HealthProfessional()
    incorrectHealthProfessional.type = ''

    const healthProfessionalsArr: Array<HealthProfessional> = new Array<HealthProfessionalMock>()
    for (let i = 0; i < 3; i++) {
        healthProfessionalsArr.push(new HealthProfessionalMock())
    }

    /**
     * Mock ChildrenGroup
     */
    const childrenGroup: ChildrenGroup = new ChildrenGroupMock()
    childrenGroup.user = new UserMock()

    const incorrectChildrenGroup: ChildrenGroup = new ChildrenGroup()

    const childrenGroupArr: Array<ChildrenGroup> = new Array<ChildrenGroupMock>()
    for (let i = 0; i < 3; i++) {
        childrenGroupArr.push(new ChildrenGroupMock())
    }

    const healthProfessionalRepo: IHealthProfessionalRepository = new HealthProfessionalRepositoryMock()
    const childRepo: IChildRepository = new ChildRepositoryMock()
    const institutionRepo: IInstitutionRepository = new InstitutionRepositoryMock()
    const childrenGroupRepo: IChildrenGroupRepository = new ChildrenGroupRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitMQMock()
    const rabbitmq: IEventBus = new RabbitMQMock(connectionFactoryRabbitmq)
    const customLogger: ILogger = new CustomLoggerMock()

    const childrenGroupService: IChildrenGroupService = new ChildrenGroupService(childrenGroupRepo, childRepo, customLogger)
    const healthProfessionalService: IHealthProfessionalService = new HealthProfessionalService(healthProfessionalRepo,
        institutionRepo, childrenGroupRepo, childrenGroupService, rabbitmq, customLogger)

    before(async () => {
        try {
            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI, { sslOptions: { ca: [] } })
        } catch (err) {
            throw new Error('Failure on HealthProfessionalService unit test: ' + err.message)
        }
    })

    /**
     * Method "add(healthProfessional: HealthProfessional)"
     */
    describe('add(healthProfessional: HealthProfessional)', () => {
        context('when the HealthProfessional is correct and it still does not exist in the repository', () => {
            it('should return the HealthProfessional that was added', () => {
                return healthProfessionalService.add(healthProfessional)
                    .then(result => {
                        assert.propertyVal(result, 'id', healthProfessional.id)
                        assert.propertyVal(result, 'username', healthProfessional.username)
                        assert.propertyVal(result, 'password', healthProfessional.password)
                        assert.propertyVal(result, 'type', healthProfessional.type)
                        assert.propertyVal(result, 'scopes', healthProfessional.scopes)
                        assert.propertyVal(result, 'institution', healthProfessional.institution)
                        assert.propertyVal(result, 'children_groups', healthProfessional.children_groups)
                        assert.propertyVal(result, 'last_login', healthProfessional.last_login)
                    })
            })
        })

        context('when the HealthProfessional is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                healthProfessional.id = '507f1f77bcf86cd799439011'        // Make mock throw an exception

                return healthProfessionalService.add(healthProfessional)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.HEALTH_PROFESSIONAL.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the HealthProfessional is correct and it still does not exist in the repository but the institution ' +
            'is not registered', () => {
            it('should throw a ValidationException', () => {
                healthProfessional.id = '507f1f77bcf86cd799439012'
                healthProfessional.institution!.id = '507f1f77bcf86cd799439012'      // Make mock throw an exception

                return healthProfessionalService.add(healthProfessional)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.INSTITUTION.ALERT_REGISTER_REQUIRED)
                    })
            })
        })

        context('when the HealthProfessional is incorrect (missing fields)', () => {
            it('should throw a ValidationException', () => {
                return healthProfessionalService.add(incorrectHealthProfessional)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        assert.propertyVal(err, 'description', 'username, password, type, ' +
                            'institution'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                    })
            })
        })

        context('when the HealthProfessional is incorrect (the institution id is invalid)', () => {
            it('should throw a ValidationException', () => {
                healthProfessional.institution!.id = '507f1f77bcf86cd7994390111'

                return healthProfessionalService.add(healthProfessional)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "getAll(query: IQuery)"
     */
    describe('getAll(query: IQuery)', () => {
        context('when there is at least one HealthProfessional object in the database that matches the query filters', () => {
            it('should return an HealthProfessional array', () => {
                healthProfessional.institution!.id = '507f1f77bcf86cd799439011'
                healthProfessional.id = '507f1f77bcf86cd799439011'     // Make mock return a filled array
                const query: IQuery = new Query()
                query.filters = { _id: healthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }

                return healthProfessionalService.getAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no HealthProfessional object in the database that matches the query filters', () => {
            it('should return an empty array', () => {
                healthProfessional.id = '507f1f77bcf86cd799439012'         // Make mock return an empty array
                const query: IQuery = new Query()
                query.filters = { _id: healthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }

                return healthProfessionalService.getAll(query)
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
        context('when there is a HealthProfessional with the received parameters', () => {
            it('should return the HealthProfessional that was found', () => {
                healthProfessional.id = '507f1f77bcf86cd799439011'         // Make mock return a Child
                const query: IQuery = new Query()
                query.filters = { _id: healthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }

                return healthProfessionalService.getById(healthProfessional.id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no HealthProfessional with the received parameters', () => {
            it('should return undefined', () => {
                healthProfessional.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                const query: IQuery = new Query()
                query.filters = { _id: healthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }

                return healthProfessionalService.getById(healthProfessional.id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the HealthProfessional id is invalid', () => {
            it('should throw a ValidationException', () => {
                incorrectHealthProfessional.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception
                const query: IQuery = new Query()
                query.filters = { _id: incorrectHealthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }

                return healthProfessionalService.getById(incorrectHealthProfessional.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.HEALTH_PROFESSIONAL.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "update(healthProfessional: HealthProfessional)"
     */
    describe('update(healthProfessional: HealthProfessional)', () => {
        context('when the HealthProfessional exists in the database', () => {
            it('should return the HealthProfessional that was updated', () => {
                healthProfessional.password = undefined
                healthProfessional.id = '507f1f77bcf86cd799439011'         // Make mock return an updated child

                return healthProfessionalService.update(healthProfessional)
                    .then(result => {
                        assert.propertyVal(result, 'id', healthProfessional.id)
                        assert.propertyVal(result, 'username', healthProfessional.username)
                        assert.propertyVal(result, 'password', healthProfessional.password)
                        assert.propertyVal(result, 'type', healthProfessional.type)
                        assert.propertyVal(result, 'scopes', healthProfessional.scopes)
                        assert.propertyVal(result, 'institution', healthProfessional.institution)
                        assert.propertyVal(result, 'children_groups', healthProfessional.children_groups)
                        assert.propertyVal(result, 'last_login', healthProfessional.last_login)
                    })
            })
        })

        context('when the HealthProfessional does not exist in the database', () => {
            it('should return undefined', () => {
                healthProfessional.id = '507f1f77bcf86cd799439013'         // Make mock return undefined

                return healthProfessionalService.update(healthProfessional)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the HealthProfessional is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
                incorrectHealthProfessional.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception

                return healthProfessionalService.update(incorrectHealthProfessional)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.HEALTH_PROFESSIONAL.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the HealthProfessional is incorrect (invalid institution id)', () => {
            it('should throw a ValidationException', () => {
                incorrectHealthProfessional.id = '507f1f77bcf86cd799439011'
                incorrectHealthProfessional.institution = new InstitutionMock()
                incorrectHealthProfessional.institution!.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception

                return healthProfessionalService.update(incorrectHealthProfessional)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Child is incorrect (attempt to update password)', () => {
            it('should throw a ValidationException', () => {
                healthProfessional.password = 'health_professional_password'

                return healthProfessionalService.update(healthProfessional)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'This parameter could not be updated.')
                        assert.propertyVal(err, 'description', 'A specific route to update user password already exists.' +
                            'Access: PATCH /users/507f1f77bcf86cd799439013/password to update your password.')
                    })
            })
        })

        context('when the Child is incorrect (the institution is not registered)', () => {
            it('should throw a ValidationException', () => {
                healthProfessional.password = undefined
                healthProfessional.institution!.id = '507f1f77bcf86cd799439012'

                return healthProfessionalService.update(healthProfessional)
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
        context('when there is HealthProfessional with the received parameter', () => {
            it('should return true', () => {
                healthProfessional.id = '507f1f77bcf86cd799439015'         // Make mock return true

                return healthProfessionalService.remove(healthProfessional.id)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no HealthProfessional with the received parameter', () => {
            it('should return false', () => {
                healthProfessional.id = '507f1f77bcf86cd799439012'         // Make mock return false

                return healthProfessionalService.remove(healthProfessional.id)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when the Child is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
                incorrectHealthProfessional.id = '507f1f77bcf86cd7994390111'       // Make mock throw an exception

                return healthProfessionalService.remove(incorrectHealthProfessional.id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.HEALTH_PROFESSIONAL.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "saveChildrenGroup(healthProfessionalId: string, childrenGroup: ChildrenGroup)"
     */
    describe('saveChildrenGroup(healthProfessionalId: string, childrenGroup: ChildrenGroup)', () => {
        context('when there is HealthProfessional with the received parameter', () => {
            it('should return a ChildrenGroup that was added', () => {
                if (childrenGroup.children) {
                    childrenGroup.children.forEach(childItem => {
                        childItem.id = '507f1f77bcf86cd799439011'
                    })
                }
                healthProfessional.id = '507f1f77bcf86cd799439011'

                return healthProfessionalService.saveChildrenGroup(healthProfessional.id, childrenGroup)
                    .then(result => {
                        assert.propertyVal(result, 'id', childrenGroup.id)
                        assert.propertyVal(result, 'name', childrenGroup.name)
                        assert.propertyVal(result, 'children', childrenGroup.children)
                        assert.propertyVal(result, 'school_class', childrenGroup.school_class)
                        assert.propertyVal(result, 'user', childrenGroup.user)
                    })
            })
        })

        context('when there is no HealthProfessional with the received parameter', () => {
            it('should return a ChildrenGroup that was added', () => {
                healthProfessional.id = '507f1f77bcf86cd799439012'

                return healthProfessionalService.saveChildrenGroup(healthProfessional.id, childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.HEALTH_PROFESSIONAL.NOT_FOUND)
                        assert.propertyVal(err, 'description', Strings.HEALTH_PROFESSIONAL.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the ChildrenGroup is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                healthProfessional.id = '507f1f77bcf86cd799439011'
                childrenGroup.id = '507f1f77bcf86cd799439011'        // Make mock throw an exception

                return healthProfessionalService.saveChildrenGroup(healthProfessional.id!, childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILDREN_GROUP.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the ChildrenGroup is correct and it still does not exist in the repository but the children are not ' +
            'registered', () => {
            it('should throw a ValidationException', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'
                childrenGroup.children![0].id = '507f1f77bcf86cd799439012'      // Make mock throw an exception

                return healthProfessionalService.saveChildrenGroup(healthProfessional.id!, childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.CHILD.IDS_WITHOUT_REGISTER
                            .concat(Strings.CHILD.CHILDREN_REGISTER_REQUIRED))
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (the user id is invalid)', () => {
            it('should throw a ValidationException', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'
                childrenGroup.user!.id = '507f1f77bcf86cd7994390111'      // Make mock throw an exception

                return healthProfessionalService.saveChildrenGroup(healthProfessional.id!, childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (missing ChildrenGroup fields)', () => {
            it('should throw a ValidationException', () => {
                return healthProfessionalService.saveChildrenGroup(healthProfessional.id!, incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        assert.propertyVal(err, 'description', 'name, user, Collection with ' +
                            'children IDs'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (missing ChildrenGroup (missing some child id) fields)', () => {
            it('should throw a ValidationException', () => {
                incorrectChildrenGroup.children = [new Child()]         // Make mock throw an exception

                return healthProfessionalService.saveChildrenGroup(healthProfessional.id!, incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.INVALID_MULTIPLE_UUID)
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (some child id is invalid)', () => {
            it('should throw a ValidationException', () => {
                const childTest: Child = new Child()
                childTest.id = '507f1f77bcf86cd7994390111'          // Make mock throw an exception
                incorrectChildrenGroup.children = [childTest]

                return healthProfessionalService.saveChildrenGroup(healthProfessional.id!, childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "getAllChildrenGroups(healthProfessionalId: string, query: IQuery)"
     */
    describe('getAllChildrenGroups(healthProfessionalId: string, query: IQuery)', () => {
        context('when there is an HealthProfessional and at least one group of children with the received parameters', () => {
            it('should return a ChildrenGroup array', () => {
                healthProfessional.id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = { _id : healthProfessional.id }

                return healthProfessionalService.getAllChildrenGroups(healthProfessional.id, query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no HealthProfessional with the received parameter', () => {
            it('should return an empty array', () => {
                healthProfessional.id = '507f1f77bcf86cd799439012'
                const query: IQuery = new Query()
                query.filters = { _id : healthProfessional.id }

                return healthProfessionalService.getAllChildrenGroups(healthProfessional.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.HEALTH_PROFESSIONAL.NOT_FOUND)
                        assert.propertyVal(err, 'description', Strings.HEALTH_PROFESSIONAL.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the HealthProfessional id is invalid', () => {
            it('should throw a ValidationException', () => {
                healthProfessional.id = '507f1f77bcf86cd7994390111'      // Make mock throw an exception
                const query: IQuery = new Query()
                query.filters = { _id : healthProfessional.id }

                return healthProfessionalService.getAllChildrenGroups(healthProfessional.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.HEALTH_PROFESSIONAL.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "getChildrenGroupById(healthProfessionalId: string, childrenGroupId: string, query: IQuery)"
     */
    describe('getChildrenGroupById(healthProfessionalId: string, childrenGroupId: string, query: IQuery)', () => {
        context('when there is an HealthProfessional and a ChildrenGroup with the received parameters', () => {
            it('should return the ChildrenGroup that was found', () => {
                healthProfessional.id = '507f1f77bcf86cd799439011'            // Make mock return a ChildrenGroup
                healthProfessional.children_groups![0].id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = { _id : healthProfessional.children_groups![0].id }

                return healthProfessionalService.getChildrenGroupById(healthProfessional.id,
                    healthProfessional.children_groups![0].id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no HealthProfessional with the received parameter', () => {
            it('should return undefined', () => {
                healthProfessional.id = '507f1f77bcf86cd799439012'            // Make mock return undefined
                healthProfessional.children_groups![0].id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = { _id : healthProfessional.children_groups![0].id }

                return healthProfessionalService.getChildrenGroupById(healthProfessional.id,
                    healthProfessional.children_groups![0].id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.HEALTH_PROFESSIONAL.NOT_FOUND)
                        assert.propertyVal(err, 'description', Strings.HEALTH_PROFESSIONAL.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the ChildrenGroup does not belong to the HealthProfessional', () => {
            it('should return undefined', () => {
                healthProfessional.id = '507f1f77bcf86cd799439011'
                healthProfessional.children_groups![0].id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = { _id : healthProfessional.children_groups![0].id }

                return healthProfessionalService.getChildrenGroupById(healthProfessional.id, childrenGroup.id!, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the HealthProfessional id is invalid', () => {
            it('should throw a ValidationException', () => {
                healthProfessional.id = '507f1f77bcf86cd7994390111'      // Make mock throw an exception
                healthProfessional.children_groups![0].id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = { _id : healthProfessional.children_groups![0].id }

                return healthProfessionalService.getChildrenGroupById(healthProfessional.id,
                    healthProfessional.children_groups![0].id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.HEALTH_PROFESSIONAL.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the ChildrenGroup id is invalid', () => {
            it('should throw a ValidationException', () => {
                healthProfessional.id = '507f1f77bcf86cd799439011'
                healthProfessional.children_groups![0].id = '507f1f77bcf86cd7994390111'  // Make mock throw an exception
                const query: IQuery = new Query()
                query.filters = { _id : healthProfessional.children_groups![0].id }

                return healthProfessionalService.getChildrenGroupById(healthProfessional.id,
                    healthProfessional.children_groups![0].id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILDREN_GROUP.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "updateChildrenGroup(healthProfessionalId: string, childrenGroup: ChildrenGroup)"
     */
    describe('updateChildrenGroup(healthProfessionalId: string, childrenGroup: ChildrenGroup)', () => {
        context('when there is HealthProfessional with the received parameter', () => {
            it('should return the ChildrenGroup that was updated', () => {
                if (healthProfessional.children_groups) {
                    healthProfessional.children_groups.forEach(childrenGroupItem => {
                        if (childrenGroupItem.children) {
                            childrenGroupItem.children.forEach(childItem => {
                                childItem.id = '507f1f77bcf86cd799439011'
                            })
                        }
                    })
                }
                healthProfessional.children_groups![0].id = '507f1f77bcf86cd799439011'        // Make id valid again

                return healthProfessionalService.updateChildrenGroup(healthProfessional.id!,
                    healthProfessional.children_groups![0])
                    .then(result => {
                        assert.propertyVal(result, 'id', healthProfessional.children_groups![0].id)
                        assert.propertyVal(result, 'name', healthProfessional.children_groups![0].name)
                        assert.propertyVal(result, 'children', healthProfessional.children_groups![0].children)
                        assert.propertyVal(result, 'school_class', healthProfessional.children_groups![0].school_class)
                        assert.propertyVal(result, 'user', healthProfessional.children_groups![0].user)
                    })
            })
        })

        context('when there is no HealthProfessional with the received parameter', () => {
            it('should throw a ValidationException', () => {
                healthProfessional.id = '507f1f77bcf86cd799439012'

                return healthProfessionalService.updateChildrenGroup(healthProfessional.id,
                    healthProfessional.children_groups![0])
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.HEALTH_PROFESSIONAL.NOT_FOUND)
                        assert.propertyVal(err, 'description', Strings.HEALTH_PROFESSIONAL.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the HealthProfessional id is invalid', () => {
            it('should throw a ValidationException', () => {
                healthProfessional.id = '507f1f77bcf86cd7994390111'      // Make mock throw an exception

                return healthProfessionalService.updateChildrenGroup(healthProfessional.id,
                    healthProfessional.children_groups![0])
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.HEALTH_PROFESSIONAL.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the ChildrenGroup id is invalid', () => {
            it('should throw a ValidationException', () => {
                healthProfessional.id = '507f1f77bcf86cd799439011'
                healthProfessional.children_groups![0].id = '507f1f77bcf86cd7994390111'  // Make mock throw an exception

                return healthProfessionalService.updateChildrenGroup(healthProfessional.id,
                    healthProfessional.children_groups![0])
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILDREN_GROUP.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the ChildrenGroup exists in the database but the children are not registered', () => {
            it('should throw a ValidationException', () => {
                childrenGroup.id = '507f1f77bcf86cd799439011'
                childrenGroup.children![0].id = '507f1f77bcf86cd799439012'      // Make mock throw an exception

                return healthProfessionalService.updateChildrenGroup(healthProfessional.id!, childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.CHILD.IDS_WITHOUT_REGISTER
                            .concat(Strings.CHILD.CHILDREN_REGISTER_REQUIRED))
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (missing ChildrenGroup (missing some child id) fields)', () => {
            it('should throw a ValidationException', () => {
                incorrectChildrenGroup.children = [new Child()]         // Make mock throw an exception

                return healthProfessionalService.updateChildrenGroup(healthProfessional.id!, incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.INVALID_MULTIPLE_UUID)
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (some child id is invalid)', () => {
            it('should throw a ValidationException', () => {
                const childTest: Child = new Child()
                childTest.id = '507f1f77bcf86cd7994390111'          // Make mock throw an exception
                incorrectChildrenGroup.children = [childTest]

                return healthProfessionalService.updateChildrenGroup(healthProfessional.id!, incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.MULTIPLE_UUID_NOT_VALID_FORMAT
                            .concat('507f1f77bcf86cd7994390111'))
                    })
            })
        })
    })

    /**
     * Method "deleteChildrenGroup(healthProfessionalId: string, childrenGroupId: string)"
     */
    describe('deleteChildrenGroup(healthProfessionalId: string, childrenGroupId: string)', () => {
        context('when there is an HealthProfessional and a ChildrenGroup with the received parameters', () => {
            it('should return true', () => {
                childrenGroup.id = '507f1f77bcf86cd799439011'         // Make mock return true

                return healthProfessionalService.deleteChildrenGroup(healthProfessional.id!, childrenGroup.id)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is an HealthProfessional but not a ChildrenGroup with the received parameters', () => {
            it('should return false', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'         // Make mock return false

                return healthProfessionalService.deleteChildrenGroup(healthProfessional.id!, childrenGroup.id)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when there is no HealthProfessional with the received parameters', () => {
            it('should throw a ValidationException', () => {
                healthProfessional.id = '507f1f77bcf86cd799439012'         // Make mock return false

                return healthProfessionalService.deleteChildrenGroup(healthProfessional.id, childrenGroup.id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.HEALTH_PROFESSIONAL.NOT_FOUND)
                        assert.propertyVal(err, 'description', Strings.HEALTH_PROFESSIONAL.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the HealthProfessional id is invalid', () => {
            it('should throw a ValidationException', () => {
                healthProfessional.id = '507f1f77bcf86cd7994390111'      // Make mock throw an exception

                return healthProfessionalService.updateChildrenGroup(healthProfessional.id,
                    healthProfessional.children_groups![0])
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.HEALTH_PROFESSIONAL.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the ChildrenGroup id is invalid', () => {
            it('should throw a ValidationException', () => {
                healthProfessional.id = '507f1f77bcf86cd799439011'
                healthProfessional.children_groups![0].id = '507f1f77bcf86cd7994390111'  // Make mock throw an exception

                return healthProfessionalService.updateChildrenGroup(healthProfessional.id,
                    healthProfessional.children_groups![0])
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILDREN_GROUP.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('count()', () => {
        context('when want count health professionals', () => {
            it('should return the number of health professionals', () => {
                return healthProfessionalService.count()
                    .then(res => {
                        assert.equal(res, 1)
                    })
            })
        })
    })

    describe('countChildrenGroups(healthProfessionalId: string)', () => {
        context('when there is at least one children group associated with the health professional received', () => {
            it('should return how many children groups are associated with such health professional in the database', () => {
                return healthProfessionalService.countChildrenGroups(healthProfessional.id!)
                    .then(res => {
                        assert.equal(res, 1)
                    })
            })
        })
    })
})
