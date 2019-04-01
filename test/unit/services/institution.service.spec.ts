import sinon from 'sinon'
import { assert } from 'chai'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { IInstitutionRepository } from '../../../src/application/port/institution.repository.interface'
import { InstitutionRepositoryMock } from '../../mocks/institution.repository.mock'
import { ILogger } from '../../../src/utils/custom.logger'
import { IInstitutionService } from '../../../src/application/port/institution.service.interface'
import { InstitutionService } from '../../../src/application/service/institution.service'
import { IUserRepository } from '../../../src/application/port/user.repository.interface'
import { UserRepositoryMock } from '../../mocks/user.repository.mock'
import { Institution } from '../../../src/application/domain/model/institution'
import { InstitutionMock } from '../../mocks/institution.mock'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { Strings } from '../../../src/utils/strings'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'

require('sinon-mongoose')

describe('Services: Institution', () => {
    const institution: Institution = new InstitutionMock()
    const incorrectInstitution: Institution = new InstitutionMock()

    // Mock institutions array
    const institutionsArr: Array<Institution> = new Array<InstitutionMock>()
    for (let i = 0; i < 3; i++) {
        institutionsArr.push(new InstitutionMock())
    }

    const modelFake: any = InstitutionRepoModel
    const userRepo: IUserRepository = new UserRepositoryMock()
    const institutionRepo: IInstitutionRepository = new InstitutionRepositoryMock()

    const customLogger: ILogger = new CustomLoggerMock()

    const institutionService: IInstitutionService = new InstitutionService(institutionRepo, userRepo, customLogger)

    afterEach(() => {
        sinon.restore()
    })

    /**
     * Method "add(institution: Institution)"
     */
    describe('add(institution: Institution)', () => {
        context('when the Institution is correct and it still does not exist in the repository', () => {
            it('should return the Institution that was added', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(institution)
                    .chain('exec')
                    .resolves(institution)

                return institutionService.add(institution)
                    .then(result => {
                        assert.propertyVal(result, 'id', institution.id)
                        assert.propertyVal(result, 'type', institution.type)
                        assert.propertyVal(result, 'name', institution.name)
                        assert.propertyVal(result, 'address', institution.address)
                        assert.propertyVal(result, 'latitude', institution.latitude)
                        assert.propertyVal(result, 'longitude', institution.longitude)
                    })
            })
        })

        context('when the Institution is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                incorrectInstitution.id = '507f1f77bcf86cd799439011'        // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectInstitution)
                    .chain('exec')
                    .rejects({ message: Strings.INSTITUTION.ALREADY_REGISTERED})

                return institutionService.add(incorrectInstitution)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the Institution is incorrect (missing fields)', () => {
            it('should throw a ValidationException', () => {
                incorrectInstitution.name = ''      // Make mock throw an exception
                incorrectInstitution.type = ''
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectInstitution)
                    .chain('exec')
                    .rejects({ message: 'Required fields were not provided...',
                               description: 'Institution validation: name, type is required!' })

                return institutionService.add(incorrectInstitution)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Institution validation: name, type is required!')
                    })
            })
        })
    })

    /**
     * Method "getAll(query: IQuery)"
     */
    describe('getAll(query: IQuery)', () => {
        context('when there is at least one institution object in the database that matches the query filters', () => {
            it('should return an Institution array', () => {
                institution.id = '507f1f77bcf86cd799439011'     // Make mock return a filled array
                const query: IQuery = new Query()
                query.filters = { _id: institution.id }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(institutionsArr)

                return institutionService.getAll(query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no institution object in the database that matches the query filters', () => {
            it('should return an empty array', () => {
                institution.id = '507f1f77bcf86cd799439012'         // Make mock return an empty array
                const query: IQuery = new Query()
                query.filters = { _id: institution.id }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(new Array(new InstitutionMock()))

                return institutionService.getAll(query)
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
        context('when there is a institution with the received parameters', () => {
            it('should return the Institution that was found', () => {
                institution.id = '507f1f77bcf86cd799439011'         // Make mock return a Institution
                const query: IQuery = new Query()
                query.filters = { _id: institution.id }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(institution)

                return institutionService.getById(institution.id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no institution with the received parameters', () => {
            it('should return undefined', () => {
                institution.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                const query: IQuery = new Query()
                query.filters = { _id: institution.id }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(undefined)

                return institutionService.getById(institution.id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the institution id is invalid', () => {
            it('should throw a ValidationException', () => {
                incorrectInstitution.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception
                const query: IQuery = new Query()
                query.filters = { _id: incorrectInstitution.id }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return institutionService.getById(incorrectInstitution.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "update(institution: Institution)"
     */
    describe('update(institution: Institution)', () => {
        context('when the Institution exists in the database', () => {
            it('should return the Institution that was updated', () => {
                institution.id = '507f1f77bcf86cd799439011'         // Make mock return an updated institution
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(institution)
                    .chain('exec')
                    .resolves(institution)

                return institutionService.update(institution)
                    .then(result => {
                        assert.propertyVal(result, 'id', institution.id)
                        assert.propertyVal(result, 'type', institution.type)
                        assert.propertyVal(result, 'name', institution.name)
                        assert.propertyVal(result, 'address', institution.address)
                        assert.propertyVal(result, 'latitude', institution.latitude)
                        assert.propertyVal(result, 'longitude', institution.longitude)
                    })
            })
        })

        context('when the Institution does not exist in the database', () => {
            it('should return undefined', () => {
                institution.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(institution)
                    .chain('exec')
                    .resolves(undefined)

                return institutionService.update(institution)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the Institution is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
                incorrectInstitution.id = '507f1f77bcf86cd7994390113'       // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectInstitution)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return institutionService.update(incorrectInstitution)
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
        context('when there is Institution with the received parameter', () => {
            it('should return true', () => {
                institution.id = '507f1f77bcf86cd799439012'         // Make mock return true
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(institution.id)
                    .chain('exec')
                    .resolves(true)

                return institutionService.remove(institution.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no Institution with the received parameter', () => {
            it('should return false', () => {
                institution.id = '507f1f77bcf86cd799439013'         // Make mock return false
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(institution.id)
                    .chain('exec')
                    .resolves(false)

                return institutionService.remove(institution.id)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when the Institution is incorrect (invalid id)', () => {
            it('should throw a ValidationException', () => {
                incorrectInstitution.id = '507f1f77bcf86cd7994390111'       // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(incorrectInstitution.id)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                        description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return institutionService.remove(incorrectInstitution.id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Institution is associated with one or more users.', () => {
            it('should throw a ValidationException', () => {
                incorrectInstitution.id = '507f1f77bcf86cd799439011'       // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(incorrectInstitution.id)
                    .chain('exec')
                    .rejects({ message: Strings.INSTITUTION.HAS_ASSOCIATION })

                return institutionService.remove(incorrectInstitution.id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.HAS_ASSOCIATION)
                    })
            })
        })
    })
})
