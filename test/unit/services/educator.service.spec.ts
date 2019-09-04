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
import { ConnectionFactoryRabbitmqMock } from '../../mocks/connection.factory.rabbitmq.mock'
import { IConnectionEventBus } from '../../../src/infrastructure/port/connection.event.bus.interface'
import { EventBusRabbitmqMock } from '../../mocks/event.bus.rabbitmq.mock'
import { ConnectionRabbitmqMock } from '../../mocks/connection.rabbitmq.mock'
import { IEventBus } from '../../../src/infrastructure/port/event.bus.interface'
import { IIntegrationEventRepository } from '../../../src/application/port/integration.event.repository.interface'
import { IntegrationEventRepositoryMock } from '../../mocks/integration.event.repository.mock'
import { EducatorMock } from '../../mocks/educator.mock'
import { Educator } from '../../../src/application/domain/model/educator'
import { IChildrenGroupService } from '../../../src/application/port/children.group.service.interface'
import { ChildrenGroupService } from '../../../src/application/service/children.group.service'
import { IEducatorService } from '../../../src/application/port/educator.service.interface'
import { EducatorService } from '../../../src/application/service/educator.service'
import { IEducatorRepository } from '../../../src/application/port/educator.repository.interface'
import { EducatorRepositoryMock } from '../../mocks/educator.repository.mock'
import { Strings } from '../../../src/utils/strings'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { UserType } from '../../../src/application/domain/model/user'
import { InstitutionMock } from '../../mocks/institution.mock'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { ChildrenGroupMock } from '../../mocks/children.group.mock'
import { UserMock } from '../../mocks/user.mock'
import { Child } from '../../../src/application/domain/model/child'

describe('Services: Educator', () => {
    /**
     * Mock Educator
     */
    const educator: Educator = new EducatorMock()
    educator.password = 'educator_password'
    educator.institution!.id = '507f1f77bcf86cd799439011'

    const incorrectEducator: Educator = new Educator()
    incorrectEducator.type = ''

    const educatorsArr: Array<Educator> = new Array<EducatorMock>()
    for (let i = 0; i < 3; i++) {
        educatorsArr.push(new EducatorMock())
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

    const educatorRepo: IEducatorRepository = new EducatorRepositoryMock()
    const childRepo: IChildRepository = new ChildRepositoryMock()
    const institutionRepo: IInstitutionRepository = new InstitutionRepositoryMock()
    const childrenGroupRepo: IChildrenGroupRepository = new ChildrenGroupRepositoryMock()
    const integrationRepo: IIntegrationEventRepository = new IntegrationEventRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitmqMock()
    const connectionRabbitmqPub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const connectionRabbitmqSub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const eventBusRabbitmq: IEventBus = new EventBusRabbitmqMock(connectionRabbitmqPub, connectionRabbitmqSub)
    const customLogger: ILogger = new CustomLoggerMock()

    const childrenGroupService: IChildrenGroupService = new ChildrenGroupService(childrenGroupRepo, childRepo, customLogger)
    const educatorService: IEducatorService = new EducatorService(educatorRepo, institutionRepo, childrenGroupRepo,
        childrenGroupService, integrationRepo, eventBusRabbitmq, customLogger)

    before(async () => {
        try {
            await connectionRabbitmqPub.tryConnect(0, 500)
            await connectionRabbitmqSub.tryConnect(0, 500)
        } catch (err) {
            throw new Error('Failure on EducatorService unit test: ' + err.message)
        }
    })

    /**
     * Method "add(educator: Educator)"
     */
    describe('add(educator: Educator)', () => {
        context('when the Educator is correct and it still does not exist in the repository', () => {
            it('should return the Educator that was added', () => {
                return educatorService.add(educator)
                    .then(result => {
                        assert.propertyVal(result, 'id', educator.id)
                        assert.propertyVal(result, 'username', educator.username)
                        assert.propertyVal(result, 'password', educator.password)
                        assert.propertyVal(result, 'type', educator.type)
                        assert.propertyVal(result, 'scopes', educator.scopes)
                        assert.propertyVal(result, 'institution', educator.institution)
                        assert.propertyVal(result, 'children_groups', educator.children_groups)
                        assert.propertyVal(result, 'last_login', educator.last_login)
                    })
            })
        })

        context('when the Educator is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                educator.id = '507f1f77bcf86cd799439011'        // Make mock throw an exception

                return educatorService.add(educator)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.EDUCATOR.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the Educator is correct and it still does not exist in the repository but the institution is not ' +
            'registered', () => {
            it('should throw a ValidationException', () => {
                educator.id = '507f1f77bcf86cd799439012'
                educator.institution!.id = '507f1f77bcf86cd799439012'      // Make mock throw an exception

                return educatorService.add(educator)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.INSTITUTION.ALERT_REGISTER_REQUIRED)
                    })
            })
        })

        context('when the Educator is incorrect (missing fields)', () => {
            it('should throw a ValidationException', () => {
                return educatorService.add(incorrectEducator)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Educator validation: username, password, type, ' +
                            'institution is required!')
                    })
            })
        })

        context('when the Educator is incorrect (the institution id is invalid)', () => {
            it('should throw a ValidationException', () => {
                educator.institution!.id = '507f1f77bcf86cd7994390111'

                return educatorService.add(educator)
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
        context('when there is at least one educator object in the database that matches the query filters', () => {
            it('should return an Educator array', () => {
                educator.institution!.id = '507f1f77bcf86cd799439011'
                educator.id = '507f1f77bcf86cd799439011'     // Make mock return a filled array
                const query: IQuery = new Query()
                query.filters = { _id: educator.id, type: UserType.EDUCATOR }

                return educatorService.getAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no educator object in the database that matches the query filters', () => {
            it('should return an empty array', () => {
                educator.id = '507f1f77bcf86cd799439012'         // Make mock return an empty array
                const query: IQuery = new Query()
                query.filters = { _id: educator.id, type: UserType.EDUCATOR }

                return educatorService.getAll(query)
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
        context('when there is a educator with the received parameters', () => {
            it('should return the Educator that was found', () => {
                educator.id = '507f1f77bcf86cd799439011'         // Make mock return a Educator
                const query: IQuery = new Query()
                query.filters = { _id: educator.id, type: UserType.EDUCATOR }

                return educatorService.getById(educator.id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no educator with the received parameters', () => {
            it('should return undefined', () => {
                educator.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                const query: IQuery = new Query()
                query.filters = { _id: educator.id, type: UserType.EDUCATOR }

                return educatorService.getById(educator.id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the educator id is invalid', () => {
            it('should throw a ValidationException', () => {
                incorrectEducator.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception
                const query: IQuery = new Query()
                query.filters = { _id: incorrectEducator.id, type: UserType.EDUCATOR }

                return educatorService.getById(incorrectEducator.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.EDUCATOR.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "update(educator: Educator)"
     */
    describe('update(educator: Educator)', () => {
        context('when the Educator exists in the database', () => {
            it('should return the Educator that was updated', () => {
                educator.password = ''
                educator.id = '507f1f77bcf86cd799439011'         // Make mock return an updated child

                return educatorService.update(educator)
                    .then(result => {
                        assert.propertyVal(result, 'id', educator.id)
                        assert.propertyVal(result, 'username', educator.username)
                        assert.propertyVal(result, 'password', educator.password)
                        assert.propertyVal(result, 'type', educator.type)
                        assert.propertyVal(result, 'scopes', educator.scopes)
                        assert.propertyVal(result, 'institution', educator.institution)
                        assert.propertyVal(result, 'children_groups', educator.children_groups)
                        assert.propertyVal(result, 'last_login', educator.last_login)
                    })
            })
        })

        context('when the Educator exists in the database but there is no connection to the RabbitMQ', () => {
            it('should return the Educator that was saved', () => {
                connectionRabbitmqPub.isConnected = false

                return educatorService.update(educator)
                    .then(result => {
                        assert.propertyVal(result, 'id', educator.id)
                        assert.propertyVal(result, 'username', educator.username)
                        assert.propertyVal(result, 'password', educator.password)
                        assert.propertyVal(result, 'type', educator.type)
                        assert.propertyVal(result, 'scopes', educator.scopes)
                        assert.propertyVal(result, 'institution', educator.institution)
                        assert.propertyVal(result, 'children_groups', educator.children_groups)
                        assert.propertyVal(result, 'last_login', educator.last_login)
                    })
            })
        })

        context('when the Educator exists in the database, there is no connection to the RabbitMQ ' +
            'but the event could not be saved', () => {
            it('should return the Educator because the current implementation does not throw an exception, ' +
                'it just prints a log', () => {
                educator.id = '507f1f77bcf86cd799439012'           // Make mock throw an error in IntegrationEventRepository

                return educatorService.update(educator)
                    .then(result => {
                        assert.propertyVal(result, 'id', educator.id)
                        assert.propertyVal(result, 'username', educator.username)
                        assert.propertyVal(result, 'password', educator.password)
                        assert.propertyVal(result, 'type', educator.type)
                        assert.propertyVal(result, 'scopes', educator.scopes)
                        assert.propertyVal(result, 'institution', educator.institution)
                        assert.propertyVal(result, 'children_groups', educator.children_groups)
                        assert.propertyVal(result, 'last_login', educator.last_login)
                    })
            })
        })

        context('when the Educator does not exist in the database', () => {
            it('should return undefined', () => {
                connectionRabbitmqPub.isConnected = true
                educator.id = '507f1f77bcf86cd799439013'         // Make mock return undefined

                return educatorService.update(educator)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the Educator is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
                incorrectEducator.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception

                return educatorService.update(incorrectEducator)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Educator is incorrect (invalid institution id)', () => {
            it('should throw a ValidationException', () => {
                incorrectEducator.id = '507f1f77bcf86cd799439011'
                incorrectEducator.institution = new InstitutionMock()
                incorrectEducator.institution!.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception

                return educatorService.update(incorrectEducator)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Educator is incorrect (attempt to update password)', () => {
            it('should throw a ValidationException', () => {
                educator.password = 'educator_password'

                return educatorService.update(educator)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'This parameter could not be updated.')
                        assert.propertyVal(err, 'description', 'A specific route to update user password already exists.' +
                            'Access: PATCH /users/507f1f77bcf86cd799439013/password to update your password.')
                    })
            })
        })

        context('when the Educator is incorrect (the institution is not registered)', () => {
            it('should throw a ValidationException', () => {
                educator.password = ''
                educator.institution!.id = '507f1f77bcf86cd799439012'

                return educatorService.update(educator)
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
        context('when there is Educator with the received parameter', () => {
            it('should return true', () => {
                educator.id = '507f1f77bcf86cd799439013'         // Make mock return true

                return educatorService.remove(educator.id)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no Educator with the received parameter', () => {
            it('should return false', () => {
                educator.id = '507f1f77bcf86cd799439012'         // Make mock return false

                return educatorService.remove(educator.id)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when the Educator is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
                incorrectEducator.id = '507f1f77bcf86cd7994390111'       // Make mock throw an exception

                return educatorService.remove(incorrectEducator.id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.EDUCATOR.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "saveChildrenGroup(educatorId: string, childrenGroup: ChildrenGroup)"
     */
    describe('saveChildrenGroup(educatorId: string, childrenGroup: ChildrenGroup)', () => {
        context('when there is Educator with the received parameter', () => {
            it('should return a ChildrenGroup that was added', () => {
                if (childrenGroup.children) {
                    childrenGroup.children.forEach(childItem => {
                        childItem.id = '507f1f77bcf86cd799439011'
                    })
                }
                educator.id = '507f1f77bcf86cd799439011'

                return educatorService.saveChildrenGroup(educator.id, childrenGroup)
                    .then(result => {
                        assert.propertyVal(result, 'id', childrenGroup.id)
                        assert.propertyVal(result, 'name', childrenGroup.name)
                        assert.propertyVal(result, 'children', childrenGroup.children)
                        assert.propertyVal(result, 'school_class', childrenGroup.school_class)
                        assert.propertyVal(result, 'user', childrenGroup.user)
                    })
            })
        })

        context('when there is no Educator with the received parameter', () => {
            it('should return a ChildrenGroup that was added', () => {
                educator.id = '507f1f77bcf86cd799439012'

                return educatorService.saveChildrenGroup(educator.id, childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.EDUCATOR.NOT_FOUND)
                        assert.propertyVal(err, 'description', Strings.EDUCATOR.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the ChildrenGroup is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                educator.id = '507f1f77bcf86cd799439011'
                childrenGroup.id = '507f1f77bcf86cd799439011'        // Make mock throw an exception

                return educatorService.saveChildrenGroup(educator.id!, childrenGroup)
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

                return educatorService.saveChildrenGroup(educator.id!, childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.CHILD.IDS_WITHOUT_REGISTER
                            .concat(' ').concat(Strings.CHILD.CHILDREN_REGISTER_REQUIRED))
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (the user id is invalid)', () => {
            it('should throw a ValidationException', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'
                childrenGroup.user!.id = '507f1f77bcf86cd7994390111'      // Make mock throw an exception

                return educatorService.saveChildrenGroup(educator.id!, childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (missing ChildrenGroup fields)', () => {
            it('should throw a ValidationException', () => {
                return educatorService.saveChildrenGroup(educator.id!, incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Children Group validation: name, user, Collection with ' +
                            'children IDs is required!')
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (missing ChildrenGroup (missing some child id) fields)', () => {
            it('should throw a ValidationException', () => {
                incorrectChildrenGroup.children = [new Child()]         // Make mock throw an exception

                return educatorService.saveChildrenGroup(educator.id!, incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Children Group validation: name, user, Collection with ' +
                            'children IDs (ID can not be empty) is required!')
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (some child id is invalid)', () => {
            it('should throw a ValidationException', () => {
                const childTest: Child = new Child()
                childTest.id = '507f1f77bcf86cd7994390111'          // Make mock throw an exception
                incorrectChildrenGroup.children = [childTest]

                return educatorService.saveChildrenGroup(educator.id!, childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "getAllChildrenGroups(educatorId: string, query: IQuery)"
     */
    describe('getAllChildrenGroups(educatorId: string, query: IQuery)', () => {
        context('when there is an Educator and at least one group of children with the received parameters', () => {
            it('should return a ChildrenGroup array', () => {
                educator.id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = { _id : educator.id }

                return educatorService.getAllChildrenGroups(educator.id, query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no Educator with the received parameter', () => {
            it('should return an empty array', () => {
                educator.id = '507f1f77bcf86cd799439012'
                const query: IQuery = new Query()
                query.filters = { _id : educator.id }

                return educatorService.getAllChildrenGroups(educator.id, query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when the Educator id is invalid', () => {
            it('should throw a ValidationException', () => {
                educator.id = '507f1f77bcf86cd7994390111'      // Make mock throw an exception
                const query: IQuery = new Query()
                query.filters = { _id : educator.id }

                return educatorService.getAllChildrenGroups(educator.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.EDUCATOR.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "getChildrenGroupById(educatorId: string, childrenGroupId: string, query: IQuery)"
     */
    describe('getChildrenGroupById(educatorId: string, childrenGroupId: string, query: IQuery)', () => {
        context('when there is an Educator and a ChildrenGroup with the received parameters', () => {
            it('should return the ChildrenGroup that was found', () => {
                educator.id = '507f1f77bcf86cd799439011'            // Make mock return a ChildrenGroup
                educator.children_groups![0].id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = { _id : educator.children_groups![0].id }

                return educatorService.getChildrenGroupById(educator.id, educator.children_groups![0].id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no Educator with the received parameter', () => {
            it('should return undefined', () => {
                educator.id = '507f1f77bcf86cd799439012'            // Make mock return undefined
                educator.children_groups![0].id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = { _id : educator.children_groups![0].id }

                return educatorService.getChildrenGroupById(educator.id, educator.children_groups![0].id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the ChildrenGroup does not belong to the Educator', () => {
            it('should return undefined', () => {
                educator.id = '507f1f77bcf86cd799439012'            // Make mock return undefined
                educator.children_groups![0].id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = { _id : educator.children_groups![0].id }

                return educatorService.getChildrenGroupById(educator.id, childrenGroup.id!, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the Educator id is invalid', () => {
            it('should throw a ValidationException', () => {
                educator.id = '507f1f77bcf86cd7994390111'      // Make mock throw an exception
                educator.children_groups![0].id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = { _id : educator.children_groups![0].id }

                return educatorService.getChildrenGroupById(educator.id, educator.children_groups![0].id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.EDUCATOR.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the ChildrenGroup id is invalid', () => {
            it('should throw a ValidationException', () => {
                educator.id = '507f1f77bcf86cd799439011'
                educator.children_groups![0].id = '507f1f77bcf86cd7994390111'  // Make mock throw an exception
                const query: IQuery = new Query()
                query.filters = { _id : educator.children_groups![0].id }

                return educatorService.getChildrenGroupById(educator.id, educator.children_groups![0].id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILDREN_GROUP.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "updateChildrenGroup(educatorId: string, childrenGroup: ChildrenGroup)"
     */
    describe('updateChildrenGroup(educatorId: string, childrenGroup: ChildrenGroup)', () => {
        context('when there is Educator with the received parameter', () => {
            it('should return the ChildrenGroup that was updated', () => {
                if (educator.children_groups) {
                    educator.children_groups.forEach(childrenGroupItem => {
                        if (childrenGroupItem.children) {
                            childrenGroupItem.children.forEach(childItem => {
                                childItem.id = '507f1f77bcf86cd799439011'
                            })
                        }
                    })
                }
                educator.children_groups![0].id = '507f1f77bcf86cd799439011'        // Make id valid again

                return educatorService.updateChildrenGroup(educator.id!, educator.children_groups![0])
                    .then(result => {
                        assert.propertyVal(result, 'id', educator.children_groups![0].id)
                        assert.propertyVal(result, 'name', educator.children_groups![0].name)
                        assert.propertyVal(result, 'children', educator.children_groups![0].children)
                        assert.propertyVal(result, 'school_class', educator.children_groups![0].school_class)
                        assert.propertyVal(result, 'user', educator.children_groups![0].user)
                    })
            })
        })

        context('when there is no Educator with the received parameter', () => {
            it('should throw a ValidationException', () => {
                educator.id = '507f1f77bcf86cd799439012'

                return educatorService.updateChildrenGroup(educator.id, educator.children_groups![0])
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.EDUCATOR.NOT_FOUND)
                        assert.propertyVal(err, 'description', Strings.EDUCATOR.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the Educator id is invalid', () => {
            it('should throw a ValidationException', () => {
                educator.id = '507f1f77bcf86cd7994390111'      // Make mock throw an exception

                return educatorService.updateChildrenGroup(educator.id, educator.children_groups![0])
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.EDUCATOR.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the ChildrenGroup id is invalid', () => {
            it('should throw a ValidationException', () => {
                educator.id = '507f1f77bcf86cd799439011'
                educator.children_groups![0].id = '507f1f77bcf86cd7994390111'  // Make mock throw an exception

                return educatorService.updateChildrenGroup(educator.id, educator.children_groups![0])
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

                return educatorService.updateChildrenGroup(educator.id!, childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.CHILD.IDS_WITHOUT_REGISTER
                            .concat(' ').concat(Strings.CHILD.CHILDREN_REGISTER_REQUIRED))
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (missing ChildrenGroup (missing some child id) fields)', () => {
            it('should throw a ValidationException', () => {
                incorrectChildrenGroup.children = [new Child()]         // Make mock throw an exception

                return educatorService.updateChildrenGroup(educator.id!, incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Children Group validation: Collection with children IDs ' +
                            '(ID can not be empty) is required!')
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (some child id is invalid)', () => {
            it('should throw a ValidationException', () => {
                const childTest: Child = new Child()
                childTest.id = '507f1f77bcf86cd7994390111'          // Make mock throw an exception
                incorrectChildrenGroup.children = [childTest]

                return educatorService.updateChildrenGroup(educator.id!, incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "deleteChildrenGroup(educatorId: string, childrenGroupId: string)"
     */
    describe('deleteChildrenGroup(educatorId: string, childrenGroupId: string)', () => {
        context('when there is an Educator and a ChildrenGroup with the received parameters', () => {
            it('should return true', () => {
                childrenGroup.id = '507f1f77bcf86cd799439011'         // Make mock return true

                return educatorService.deleteChildrenGroup(educator.id!, childrenGroup.id)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is an Educator but not a ChildrenGroup with the received parameters', () => {
            it('should return false', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'         // Make mock return false

                return educatorService.deleteChildrenGroup(educator.id!, childrenGroup.id)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when there is no Educator with the received parameters', () => {
            it('should throw a ValidationException', () => {
                educator.id = '507f1f77bcf86cd799439012'         // Make mock return false

                return educatorService.deleteChildrenGroup(educator.id, childrenGroup.id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.EDUCATOR.NOT_FOUND)
                        assert.propertyVal(err, 'description', Strings.EDUCATOR.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the Educator id is invalid', () => {
            it('should throw a ValidationException', () => {
                educator.id = '507f1f77bcf86cd7994390111'      // Make mock throw an exception

                return educatorService.updateChildrenGroup(educator.id, educator.children_groups![0])
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.EDUCATOR.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the ChildrenGroup id is invalid', () => {
            it('should throw a ValidationException', () => {
                educator.id = '507f1f77bcf86cd799439011'
                educator.children_groups![0].id = '507f1f77bcf86cd7994390111'  // Make mock throw an exception

                return educatorService.updateChildrenGroup(educator.id, educator.children_groups![0])
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILDREN_GROUP.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('count()', () => {
        context('when there is at least one educator in the database', () => {
            it('should return how many educators there are in the database', () => {
                return educatorService.count()
                    .then(res => {
                        assert.equal(res, 1)
                    })
            })
        })
    })

    describe('countChildrenGroups(educatorId: string)', () => {
        context('when there is at least one children group associated with the educator received', () => {
            it('should return how many children groups are associated with such educator in the database', () => {
                return educatorService.countChildrenGroups(educator.id!)
                    .then(res => {
                        assert.equal(res, 1)
                    })
            })
        })
    })
})
