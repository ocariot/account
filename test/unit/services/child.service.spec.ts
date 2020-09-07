import { assert } from 'chai'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { IInstitutionRepository } from '../../../src/application/port/institution.repository.interface'
import { InstitutionRepositoryMock } from '../../mocks/institution.repository.mock'
import { ILogger } from '../../../src/utils/custom.logger'
import { Strings } from '../../../src/utils/strings'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { ChildMock } from '../../mocks/child.mock'
import { Child, Gender } from '../../../src/application/domain/model/child'
import { IChildRepository } from '../../../src/application/port/child.repository.interface'
import { ChildRepositoryMock } from '../../mocks/child.repository.mock'
import { IChildrenGroupRepository } from '../../../src/application/port/children.group.repository.interface'
import { ChildrenGroupRepositoryMock } from '../../mocks/children.group.repository.mock'
import { IFamilyRepository } from '../../../src/application/port/family.repository.interface'
import { FamilyRepositoryMock } from '../../mocks/family.repository.mock'
import { IChildService } from '../../../src/application/port/child.service.interface'
import { ChildService } from '../../../src/application/service/child.service'
import { IConnectionFactory } from '../../../src/infrastructure/port/connection.factory.interface'
import { ConnectionFactoryRabbitMQMock } from '../../mocks/connection.factory.rabbitmq.mock'
import { RabbitMQMock } from '../../mocks/rabbitmq.mock'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { UserType } from '../../../src/application/domain/model/user'
import { InstitutionMock } from '../../mocks/institution.mock'
import { Default } from '../../../src/utils/default'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { NotFoundException } from '../../../src/application/domain/exception/not.found.exception'
import { ConflictException } from '../../../src/application/domain/exception/conflict.exception'

describe('Services: Child', () => {
    const child: Child = new ChildMock()
    child.password = 'child_password'
    child.institution!.id = '507f1f77bcf86cd799439011'

    const incorrectChild: Child = new Child()
    incorrectChild.type = ''

    // Mock children array
    const childrenArr: Array<Child> = new Array<ChildMock>()
    for (let i = 0; i < 3; i++) {
        childrenArr.push(new ChildMock())
    }

    const childRepo: IChildRepository = new ChildRepositoryMock()
    const institutionRepo: IInstitutionRepository = new InstitutionRepositoryMock()
    const childrenGroupRepo: IChildrenGroupRepository = new ChildrenGroupRepositoryMock()
    const familyRepo: IFamilyRepository = new FamilyRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitMQMock()
    const rabbitmq: IEventBus = new RabbitMQMock(connectionFactoryRabbitmq)
    const customLogger: ILogger = new CustomLoggerMock()

    const childService: IChildService = new ChildService(childRepo, institutionRepo, childrenGroupRepo, familyRepo,
        rabbitmq, customLogger)

    before(async () => {
        try {
            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI, { sslOptions: { ca: [] } })
        } catch (err) {
            throw new Error('Failure on ChildService unit test: ' + err.message)
        }
    })

    /**
     * Method "add(child: Child)"
     */
    describe('add(child: Child)', () => {
        context('when the Child is correct and it still does not exist in the repository', () => {
            it('should return the Child that was added', () => {

                return childService.add(child)
                    .then(result => {
                        assert.propertyVal(result, 'id', child.id)
                        assert.propertyVal(result, 'username', child.username)
                        assert.propertyVal(result, 'password', child.password)
                        assert.propertyVal(result, 'type', child.type)
                        assert.propertyVal(result, 'institution', child.institution)
                        assert.propertyVal(result, 'gender', child.gender)
                        assert.propertyVal(result, 'age', child.age)
                        assert.propertyVal(result, 'last_login', child.last_login)
                        assert.propertyVal(result, 'last_sync', child.last_sync)
                    })
            })
        })

        context('when the Child is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                child.id = '507f1f77bcf86cd799439011'        // Make mock throw an exception

                return childService.add(child)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the Child is correct and it still does not exist in the repository but the institution is not ' +
            'registered', () => {
            it('should throw a ValidationException', () => {
                child.id = '507f1f77bcf86cd799439012'
                child.institution!.id = '507f1f77bcf86cd799439012'      // Make mock throw an exception

                return childService.add(child)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.INSTITUTION.ALERT_REGISTER_REQUIRED)
                    })
            })
        })

        context('when the Child is incorrect (missing child fields)', () => {
            it('should throw a ValidationException', () => {

                return childService.add(incorrectChild)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'username, password, type, institution, ' +
                                'gender, age'))
                    })
            })
        })

        context('when the Child is incorrect (the institution id is invalid)', () => {
            it('should throw a ValidationException', () => {
                child.institution!.id = '507f1f77bcf86cd7994390111'

                return childService.add(child)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Child is incorrect (the gender is invalid)', () => {
            it('should throw a ValidationException', () => {
                child.institution!.id = '507f1f77bcf86cd799439011'
                child.gender = 'invalid_gender'

                return childService.add(child)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        assert.propertyVal(err, 'description',
                            'The names of the allowed genders are: male, female.')
                    })
            })
        })

        context('when the Child is incorrect (the age is invalid)', () => {
            after(() => {
                child.age = '9'
            })
            it('should throw a ValidationException', () => {
                child.gender = Gender.MALE
                child.age = '-1'

                return childService.add(child)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        assert.propertyVal(err, 'description',
                            'Age cannot be less than or equal to zero!')
                    })
            })
        })
    })

    /**
     * Method "getAll(query: IQuery)"
     */
    describe('getAll(query: IQuery)', () => {
        context('when there is at least one child object in the database that matches the query filters', () => {
            it('should return an Child array', () => {
                child.institution!.id = '507f1f77bcf86cd799439011'
                child.id = '507f1f77bcf86cd799439011'     // Make mock return a filled array
                const query: IQuery = new Query()
                query.filters = { _id: child.id }

                return childService.getAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no child object in the database that matches the query filters', () => {
            it('should return an empty array', () => {
                child.id = '507f1f77bcf86cd799439012'         // Make mock return an empty array
                const query: IQuery = new Query()
                query.filters = { _id: child.id }

                return childService.getAll(query)
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
        context('when there is a child with the received parameters', () => {
            it('should return the Child that was found', () => {
                child.id = '507f1f77bcf86cd799439011'         // Make mock return a Child
                const query: IQuery = new Query()
                query.filters = { _id: child.id, type: UserType.CHILD }

                return childService.getById(child.id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no child with the received parameters', () => {
            it('should return undefined', () => {
                child.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                const query: IQuery = new Query()
                query.filters = { _id: child.id, type: UserType.CHILD }

                return childService.getById(child.id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the child id is invalid', () => {
            it('should throw a ValidationException', () => {
                incorrectChild.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception
                const query: IQuery = new Query()
                query.filters = { _id: incorrectChild.id, type: UserType.CHILD }

                return childService.getById(incorrectChild.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "update(child: Child)"
     */
    describe('update(child: Child)', () => {
        context('when the Child exists in the database', () => {
            it('should return the Child that was updated', () => {
                child.password = undefined
                child.id = '507f1f77bcf86cd799439011'
                return childService.update(child)
                    .then(result => {
                        assert.propertyVal(result, 'id', child.id)
                        assert.propertyVal(result, 'username', child.username)
                        assert.propertyVal(result, 'password', child.password)
                        assert.propertyVal(result, 'type', child.type)
                        assert.propertyVal(result, 'institution', child.institution)
                        assert.propertyVal(result, 'gender', child.gender)
                        assert.propertyVal(result, 'age', child.age)
                        assert.propertyVal(result, 'last_login', child.last_login)
                        assert.propertyVal(result, 'last_sync', child.last_sync)
                    })
            })
        })

        context('when the Child does not exist in the database', () => {
            it('should return undefined', () => {
                child.id = '507f1f77bcf86cd799439013'         // Make mock return undefined

                return childService.update(child)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the Child is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
                incorrectChild.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception

                return childService.update(incorrectChild)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Child is incorrect (invalid institution id)', () => {
            it('should throw a ValidationException', () => {
                incorrectChild.id = '507f1f77bcf86cd799439011'
                incorrectChild.institution = new InstitutionMock()
                incorrectChild.institution!.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception

                return childService.update(incorrectChild)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Child is incorrect (attempt to update password)', () => {
            it('should throw a ValidationException', () => {
                child.password = 'child_password'

                return childService.update(child)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'This parameter could not be updated.')
                        assert.propertyVal(err, 'description', 'A specific route to update user password already exists.' +
                            'Access: PATCH /users/507f1f77bcf86cd799439013/password to update your password.')
                    })
            })
        })

        context('when the Child is incorrect (the institution is not registered)', () => {
            it('should throw a ValidationException', () => {
                child.password = undefined
                child.institution!.id = '507f1f77bcf86cd799439012'

                return childService.update(child)
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
        context('when there is Child with the received parameter', () => {
            it('should return true', () => {
                child.id = '507f1f77bcf86cd799439012'         // Make mock return true

                return childService.remove(child.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no Child with the received parameter', () => {
            it('should return false', () => {
                child.id = '507f1f77bcf86cd799439013'         // Make mock return false

                return childService.remove(child.id)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when the Child is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
                incorrectChild.id = '507f1f77bcf86cd7994390111'       // Make mock throw an exception

                return childService.remove(incorrectChild.id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('count()', () => {
        context('when want count children', () => {
            it('should return the number of children', () => {
                return childService.count()
                    .then(res => {
                        assert.equal(res, 1)
                    })
            })
        })
    })

    describe('getByNfcTag(tag: string)', () => {
        it('should return the child when it finds the associated NFC tag', () => {
            return childService.getByNfcTag('04a22422dd6480')
                .then(res => {
                    assert.instanceOf(res, Child)
                })
        })

        it('should return undefined when it does not find the associated NFC tag', () => {
            return childService.getByNfcTag('123')
                .then(res => {
                    assert.isUndefined(res)
                })
        })
    })

    describe('saveNfcTag(childId: string, tag: string)', () => {
        context('when the successful', () => {
            it('should return the child when associating NFC Tag successfully', () => {
                return childService.saveNfcTag('507f1f77bcf86cd799439011', 'a4a22422dd6481')
                    .then(res => {
                        assert.instanceOf(res, Child)
                    })
            })

            it('should return the child with the updated NFC tag', () => {
                return childService.saveNfcTag('507f1f77bcf86cd799439011', 'a4a22422dd64bb')
                    .then(res => {
                        assert.instanceOf(res, Child)
                    }) && childService.saveNfcTag('507f1f77bcf86cd799439011', 'a4a22422dd64bc')
                    .then(res => {
                        assert.equal(res.nfcTag, 'a4a22422dd64bc')
                    })
            })
        })

        context('when the unsuccessful', () => {
            it('should return ValidationException for invalid child_id', () => {
                return childService.saveNfcTag('507f1f77bcf86cd7994390', 'a4a22422dd6481')
                    .catch(err => {
                        assert.instanceOf(err, ValidationException)
                        assert.equal(err.message, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })

            it('should return ValidationException for invalid nfc_tag', () => {
                // @ts-ignore
                return childService.saveNfcTag('507f1f77bcf86cd799439011', undefined)
                    .catch(err => {
                        assert.instanceOf(err, ValidationException)
                        assert.equal(err.message, Strings.CHILD.NFC_TAG_NOT_VALID_FORMAT)
                    })
            })

            it('should return NotFoundException for child not exist', () => {
                return childService.saveNfcTag('507f1f77bcf86cd799439010', 'a4a22422dd6481')
                    .catch(err => {
                        assert.instanceOf(err, NotFoundException)
                        assert.equal(err.message, Strings.CHILD.NOT_FOUND)
                        assert.equal(err.description, Strings.CHILD.NOT_FOUND_DESCRIPTION)
                    })
            })

            it('should return ConflictException for NFC Tag is exist', () => {
                return childService.saveNfcTag('507f1f77bcf86cd799439011', '04a22422dd6480')
                    .catch(err => {
                        assert.instanceOf(err, ConflictException)
                        assert.equal(err.message, Strings.CHILD.NFC_TAG_ALREADY_REGISTERED)
                        assert.equal(err.description, Strings.CHILD.NFC_TAG_ALREADY_REGISTERED_DESC)
                    })
            })
        })
    })
})

