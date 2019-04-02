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
import { FamilyMock } from '../../mocks/family.mock'
import { Family } from '../../../src/application/domain/model/family'
import { IFamilyService } from '../../../src/application/port/family.service.interface'
import { FamilyService } from '../../../src/application/service/family.service'
import { IFamilyRepository } from '../../../src/application/port/family.repository.interface'
import { FamilyRepositoryMock } from '../../mocks/family.repository.mock'
import { IChildRepository } from '../../../src/application/port/child.repository.interface'
import { ChildRepositoryMock } from '../../mocks/child.repository.mock'
import { Strings } from '../../../src/utils/strings'
import { Child } from '../../../src/application/domain/model/child'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { UserType } from '../../../src/application/domain/model/user'
import { InstitutionMock } from '../../mocks/institution.mock'

require('sinon-mongoose')

describe('Services: Family', () => {
    const family: Family = new FamilyMock()
    family.password = 'password_mock'
    family.institution!.id = '507f1f77bcf86cd799439011'

    const incorrectFamily: Family = new Family()
    incorrectFamily.type = ''

    // Mock families array
    const familiesArr: Array<Family> = new Array<FamilyMock>()
    for (let i = 0; i < 3; i++) {
        familiesArr.push(new FamilyMock())
    }

    const modelFake: any = UserRepoModel
    const familyRepo: IFamilyRepository = new FamilyRepositoryMock()
    const childRepo: IChildRepository = new ChildRepositoryMock()
    const institutionRepo: IInstitutionRepository = new InstitutionRepositoryMock()
    const integrationRepo: IIntegrationEventRepository = new IntegrationEventRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitmqMock()
    const connectionRabbitmqPub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const connectionRabbitmqSub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const eventBusRabbitmq: IEventBus = new EventBusRabbitmqMock(connectionRabbitmqPub, connectionRabbitmqSub)
    const customLogger: ILogger = new CustomLoggerMock()

    const familyService: IFamilyService = new FamilyService(familyRepo, childRepo, institutionRepo, integrationRepo,
        eventBusRabbitmq, customLogger)

    afterEach(() => {
        sinon.restore()
    })

    /**
     * Method "add(family: Family)"
     */
    describe('add(family: Family)', () => {
        context('when the Family is correct and it still does not exist in the repository', () => {
            it('should return the Family that was added', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(family)
                    .chain('exec')
                    .resolves(family)

                return familyService.add(family)
                    .then(result => {
                        assert.propertyVal(result, 'id', family.id)
                        assert.propertyVal(result, 'username', family.username)
                        assert.propertyVal(result, 'type', family.type)
                        assert.propertyVal(result, 'scopes', family.scopes)
                        assert.propertyVal(result, 'institution', family.institution)
                        assert.equal(result.children![0], family.children![0])
                        assert.equal(result.children![1], family.children![1])
                        assert.equal(result.children![2], family.children![2])
                    })
            })
        })

        context('when the Family is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                family.id = '507f1f77bcf86cd799439011'        // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(family)
                    .chain('exec')
                    .rejects({ message: Strings.FAMILY.ALREADY_REGISTERED})

                return familyService.add(family)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.FAMILY.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the Family is correct and it still does not exist in the repository but the children are not ' +
            'registered', () => {
            it('should throw a ValidationException', () => {
                family.id = '507f1f77bcf86cd799439012'
                family.children![0].id = '507f1f77bcf86cd799439012'         // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(family)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.CHILDREN_REGISTER_REQUIRED,
                        description: Strings.CHILD.IDS_WITHOUT_REGISTER })

                return familyService.add(family)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.CHILD.IDS_WITHOUT_REGISTER)
                    })
            })
        })

        context('when the Family is correct and it still does not exist in the repository but the institution is not ' +
            'registered', () => {
            it('should throw a ValidationException', () => {
                family.children![0].id = '507f1f77bcf86cd799439011'
                family.id = '507f1f77bcf86cd799439012'
                family.institution!.id = '507f1f77bcf86cd799439012'      // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(family)
                    .chain('exec')
                    .rejects({ message: Strings.INSTITUTION.REGISTER_REQUIRED,
                               description: Strings.INSTITUTION.ALERT_REGISTER_REQUIRED })

                return familyService.add(family)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.INSTITUTION.ALERT_REGISTER_REQUIRED)
                    })
            })
        })

        context('when the Family is incorrect (missing family (missing some child id) fields)', () => {
            it('should throw a ValidationException', () => {
                incorrectFamily.children = [new Child()]
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectFamily)
                    .chain('exec')
                    .rejects({ message: 'Required fields were not provided...',
                               description: 'Family validation: username, password, type, institution, Collection with ' +
                                   'children IDs (ID can not be empty) is required!' })

                return familyService.add(incorrectFamily)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Family validation: username, password, type, institution, ' +
                            'Collection with children IDs (ID can not be empty) is required!')
                    })
            })
        })

        context('when the Family is incorrect (some child id is invalid)', () => {
            it('should throw a ValidationException', () => {
                const childTest: Child = new Child()
                childTest.id = '507f1f77bcf86cd7994390111'          // Make mock throw an exception
                incorrectFamily.children = [childTest]
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectFamily)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return familyService.add(incorrectFamily)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Family is incorrect (the institution id is invalid)', () => {
            it('should throw a ValidationException', () => {
                family.institution!.id = '507f1f77bcf86cd7994390111'
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(family)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return familyService.add(family)
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
        context('when there is at least one family object in the database that matches the query filters', () => {
            it('should return a Family array', () => {
                family.id = '507f1f77bcf86cd799439011'     // Make mock return a filled array
                const query: IQuery = new Query()
                query.filters = { _id: family.id, type: UserType.FAMILY }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(familiesArr)

                return familyService.getAll(query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no family object in the database that matches the query filters', () => {
            it('should return an empty array', () => {
                family.id = '507f1f77bcf86cd799439012'         // Make mock return an empty array
                const query: IQuery = new Query()
                query.filters = { _id: family.id, type: UserType.FAMILY }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(new Array<FamilyMock>())

                return familyService.getAll(query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
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
        context('when there is a family with the received parameters', () => {
            it('should return the Family that was found', () => {
                family.id = '507f1f77bcf86cd799439011'         // Make mock return a Family
                const query: IQuery = new Query()
                query.filters = { _id: family.id, type: UserType.FAMILY }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(family)

                return familyService.getById(family.id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no family with the received parameters', () => {
            it('should return undefined', () => {
                family.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                const query: IQuery = new Query()
                query.filters = { _id: family.id, type: UserType.FAMILY }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(undefined)

                return familyService.getById(family.id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the family id is invalid', () => {
            it('should throw a ValidationException', () => {
                incorrectFamily.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception
                const query: IQuery = new Query()
                query.filters = { _id: incorrectFamily.id, type: UserType.FAMILY }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return familyService.getById(incorrectFamily.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "update(family: Family)"
     */
    describe('update(family: Family)', () => {
        context('when the Family exists in the database', () => {
            it('should return the Family that was updated', () => {
                family.institution!.id = '507f1f77bcf86cd799439011'
                family.children![0].id = '507f1f77bcf86cd799439011'
                family.password = ''
                family.id = '507f1f77bcf86cd799439011'         // Make mock return an updated Family
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .resolves(family)

                return familyService.update(family)
                    .then(result => {
                        assert.propertyVal(result, 'id', family.id)
                        assert.propertyVal(result, 'username', family.username)
                        assert.propertyVal(result, 'type', family.type)
                        assert.propertyVal(result, 'scopes', family.scopes)
                        assert.propertyVal(result, 'institution', family.institution)
                        assert.equal(result.children![0], family.children![0])
                        assert.equal(result.children![1], family.children![1])
                        assert.equal(result.children![2], family.children![2])
                    })
            })
        })

        context('when the Family exists in the database but there is no connection to the RabbitMQ', () => {
            it('should return the Family that was saved', () => {
                connectionRabbitmqPub.isConnected = false
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .resolves(family)

                return familyService.update(family)
                    .then(result => {
                        assert.propertyVal(result, 'id', family.id)
                        assert.propertyVal(result, 'username', family.username)
                        assert.propertyVal(result, 'type', family.type)
                        assert.propertyVal(result, 'scopes', family.scopes)
                        assert.propertyVal(result, 'institution', family.institution)
                        assert.equal(result.children![0], family.children![0])
                        assert.equal(result.children![1], family.children![1])
                        assert.equal(result.children![2], family.children![2])
                    })
            })
        })

        context('when the Family does not exist in the database', () => {
            it('should return undefined', () => {
                family.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .resolves(undefined)

                return familyService.update(family)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the Family is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectFamily)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                        description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return familyService.update(incorrectFamily)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Family is incorrect (invalid institution id)', () => {
            it('should throw a ValidationException', () => {
                incorrectFamily.id = '507f1f77bcf86cd799439011'
                incorrectFamily.institution = new InstitutionMock()
                incorrectFamily.institution!.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectFamily)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return familyService.update(incorrectFamily)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Family is incorrect (attempt to update password)', () => {
            it('should throw a ValidationException', () => {
                family.password = 'family_password'
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .rejects({ message: 'This parameter could not be updated.',
                               description: 'A specific route to update user password already exists.' +
                                   'Access: PATCH /users/507f1f77bcf86cd799439012/password to update your password.' })

                return familyService.update(family)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'This parameter could not be updated.')
                        assert.propertyVal(err, 'description', 'A specific route to update user password already exists.' +
                            'Access: PATCH /users/507f1f77bcf86cd799439012/password to update your password.')
                    })
            })
        })

        context('when the Family exists in the database but the children are not registered', () => {
            it('should throw a ValidationException', () => {
                family.password = ''
                family.children![0].id = '507f1f77bcf86cd799439012'      // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.CHILDREN_REGISTER_REQUIRED,
                               description: Strings.CHILD.IDS_WITHOUT_REGISTER })

                return familyService.update(family)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.CHILD.IDS_WITHOUT_REGISTER)
                    })
            })
        })

        context('when the Family is incorrect (the institution is not registered)', () => {
            it('should throw a ValidationException', () => {
                family.password = ''
                family.children![0].id = '507f1f77bcf86cd799439011'
                family.institution!.id = '507f1f77bcf86cd799439012'      // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .rejects({ message: Strings.INSTITUTION.REGISTER_REQUIRED,
                               description: Strings.INSTITUTION.ALERT_REGISTER_REQUIRED })

                return familyService.update(family)
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
        context('when there is Family with the received parameter', () => {
            it('should return true', () => {
                family.id = '507f1f77bcf86cd799439014'         // Make mock return true
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(family.id)
                    .chain('exec')
                    .resolves(true)

                return familyService.remove(family.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no Family with the received parameter', () => {
            it('should return false', () => {
                family.id = '507f1f77bcf86cd799439013'         // Make mock return false
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(family.id)
                    .chain('exec')
                    .resolves(false)

                return familyService.remove(family.id)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when the Family is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
                incorrectFamily.id = '507f1f77bcf86cd7994390111'       // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(incorrectFamily.id)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return familyService.remove(incorrectFamily.id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "getAllChildren(familyId: string, query: IQuery)"
     */
    describe('getAllChildren(familyId: string, query: IQuery)', () => {
        context('when there is at least one children object in the family object that matches the query filters', () => {
            it('should return a Children array', () => {
                family.id = '507f1f77bcf86cd799439011'     // Make mock return a filled array
                const query: IQuery = new Query()
                query.filters = { _id: family.id, type: UserType.FAMILY }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(familiesArr)

                return familyService.getAllChildren(family.id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no family object in the database that matches the query filters', () => {
            it('should return undefined', () => {
                family.id = '507f1f77bcf86cd799439012'         // Make mock return an empty array
                const query: IQuery = new Query()
                query.filters = { _id: family.id, type: UserType.FAMILY }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(new Array<FamilyMock>())

                return familyService.getAllChildren(family.id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the family id is incorrect', () => {
            it('should throw a ValidationException', () => {
                family.id = '507f1f77bcf86cd7994390111'         // Make mock throw an exception
                const query: IQuery = new Query()
                query.filters = { _id: family.id, type: UserType.FAMILY }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return familyService.getAllChildren(family.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "associateChild(familyId: string, childId: string)"
     */
    describe('associateChild(familyId: string, childId: string)', () => {
        context('when the family and the child exist', () => {
            it('should return the Family that was updated', () => {
                family.id = '507f1f77bcf86cd799439011'     // Make mock return a Family
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .resolves(family)

                return familyService.associateChild(family.id, family.children![0].id!)
                    .then(result => {
                        assert.propertyVal(result, 'id', family.id)
                        assert.propertyVal(result, 'username', family.username)
                        assert.propertyVal(result, 'type', family.type)
                        assert.property(result, 'scopes')
                        assert.property(result, 'institution')
                        assert.property(result, 'children')
                    })
            })
        })

        context('when there is no family object in the database that matches the query filters', () => {
            it('should throw a ValidationException', () => {
                family.id = '507f1f77bcf86cd799439012'         // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .rejects({ message: Strings.FAMILY.NOT_FOUND,
                               description: Strings.FAMILY.NOT_FOUND_DESCRIPTION })

                return familyService.associateChild(family.id, family.children![0].id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.FAMILY.NOT_FOUND)
                        assert.propertyVal(err, 'description', Strings.FAMILY.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when there is no child object in the database that matches the query filters', () => {
            it('should throw a ValidationException', () => {
                family.id = '507f1f77bcf86cd799439011'
                family.children![0].id = '507f1f77bcf86cd799439012'         // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.ASSOCIATION_FAILURE })

                return familyService.associateChild(family.id, family.children![0].id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.ASSOCIATION_FAILURE)
                    })
            })
        })

        context('when the family id is invalid', () => {
            it('should throw a ValidationException', () => {
                family.children![0].id = '507f1f77bcf86cd799439011'
                family.id = '507f1f77bcf86cd7994390111'         // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return familyService.associateChild(family.id, family.children![0].id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the child id is invalid', () => {
            it('should throw a ValidationException', () => {
                family.id = '507f1f77bcf86cd799439011'
                family.children![0].id = '507f1f77bcf86cd7994390111'     // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                        description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return familyService.associateChild(family.id, family.children![0].id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "disassociateChild(familyId: string, childId: string)"
     */
    describe('disassociateChild(familyId: string, childId: string)', () => {
        context('when the family and the child exist', () => {
            it('should return true', () => {
                family.children![0].id = '507f1f77bcf86cd799439011'
                family.id = '507f1f77bcf86cd799439011'     // Make mock return true
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .resolves(true)

                return familyService.disassociateChild(family.id, family.children![0].id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no family object in the database that matches the query filters', () => {
            it('should return undefined', () => {
                family.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .rejects(undefined)

                return familyService.disassociateChild(family.id, family.children![0].id!)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the family id is invalid', () => {
            it('should throw a ValidationException', () => {
                family.children![0].id = '507f1f77bcf86cd799439011'
                family.id = '507f1f77bcf86cd7994390111'         // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                        description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return familyService.disassociateChild(family.id, family.children![0].id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the child id is invalid', () => {
            it('should throw a ValidationException', () => {
                family.id = '507f1f77bcf86cd799439011'
                family.children![0].id = '507f1f77bcf86cd7994390111'     // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(family)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                        description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return familyService.disassociateChild(family.id, family.children![0].id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})
