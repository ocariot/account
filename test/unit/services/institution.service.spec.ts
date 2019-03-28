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
    const institutionArr: Array<Institution> = new Array<InstitutionMock>()
    for (let i = 0; i < 3; i++) {
        institutionArr.push(new InstitutionMock())
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
            it('should return the Institution that was added', async () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(institution)
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
            it('should throw a ConflictException', async () => {
                institution.id = '507f1f77bcf86cd799439011'
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(institution)
                    .rejects({ message: Strings.INSTITUTION.ALREADY_REGISTERED})

                return institutionService.add(institution)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.INSTITUTION.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the Institution is incorrect (missing fields)', () => {
            it('should throw a ValidationException', async () => {
                institution.name = ''
                institution.type = ''
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(institution)
                    .rejects({ message: Strings.INSTITUTION.ALREADY_REGISTERED})

                return institutionService.add(institution)
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
            it('should return an Institution array', async () => {
                const query: IQuery = new Query()
                query.filters = { _id: institution.id }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .resolves(institutionArr)

                return institutionService.getAll(query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no institution object in the database that matches the query filters', () => {
            it('should return an empty array', async () => {
                institution.id = '507f1f77bcf86cd799439012'
                const query: IQuery = new Query()
                query.filters = { _id: institution.id }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
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
            it('should return the Institution that was found', async () => {
                institution.id = '507f1f77bcf86cd799439011'
                const query: IQuery = new Query()
                query.filters = { _id: institution.id }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .resolves(institution)

                return institutionService.getById(institution.id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no institution with the received parameters', () => {
            it('should return undefined', async () => {
                institution.id = '507f1f77bcf86cd799439012'
                const query: IQuery = new Query()
                query.filters = { _id: institution.id }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .resolves(undefined)

                return institutionService.getById(institution.id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the institution id is invalid', () => {
            it('should throw a ValidationException', async () => {
                institution.id = '507f1f77bcf86cd7994390113'
                const query: IQuery = new Query()
                query.filters = { _id: institution.id }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return institutionService.getById(institution.id, query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})
