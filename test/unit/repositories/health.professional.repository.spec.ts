import sinon from 'sinon'
import { UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'
import { assert } from 'chai'
import { ObjectID } from 'bson'
import { HealthProfessional } from '../../../src/application/domain/model/health.professional'
import { HealthProfessionalMock } from '../../mocks/health.professional.mock'
import { HealthProfessionalRepository } from '../../../src/infrastructure/repository/health.professional.repository'

require('sinon-mongoose')

describe('Repositories: HealthProfessional', () => {
    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    defaultHealthProfessional.id = '507f1f77bcf86cd799439011'
    defaultHealthProfessional.password = 'health_professional_password'

    // Mock health professionals array
    const healthProfessionalsArr: Array<HealthProfessional> = new Array<HealthProfessionalMock>()
    for (let i = 0; i < 3; i++) {
        healthProfessionalsArr.push(new HealthProfessionalMock())
    }

    const modelFake: any = UserRepoModel
    const userRepo = new UserRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())
    const healthProfessionalRepo = new HealthProfessionalRepository(modelFake, new EntityMapperMock(), userRepo,
        new CustomLoggerMock())

    // Mock query
    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: { _id: defaultHealthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }
            }
        }
    }

    afterEach(() => {
        sinon.restore()
    })

    describe('create(item: HealthProfessional)', () => {
        context('when the HealthProfessional does not have password', () => {
            it('should return a HealthProfessional without password', () => {
                defaultHealthProfessional.password = undefined

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(defaultHealthProfessional)
                    .resolves(defaultHealthProfessional)
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(defaultHealthProfessional.id)
                    .chain('exec')
                    .resolves(defaultHealthProfessional)

                return healthProfessionalRepo.create(defaultHealthProfessional)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultHealthProfessional.id)
                        assert.propertyVal(result, 'username', defaultHealthProfessional.username)
                        assert.isUndefined(result.password)
                        assert.propertyVal(result, 'type', defaultHealthProfessional.type)
                        assert.propertyVal(result, 'scopes', defaultHealthProfessional.scopes)
                        assert.propertyVal(result, 'institution', defaultHealthProfessional.institution)
                        assert.propertyVal(result, 'children_groups', defaultHealthProfessional.children_groups)
                        assert.propertyVal(result, 'last_login', defaultHealthProfessional.last_login)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultHealthProfessional.password = 'health_professional_password'

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(defaultHealthProfessional)
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return healthProfessionalRepo.create(defaultHealthProfessional)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('find(query: IQuery)', () => {
        context('when there is at least one healthProfessional that corresponds to the received parameters', () => {
            it('should return an HealthProfessional array', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(healthProfessionalsArr)

                return healthProfessionalRepo.find(queryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is at least one healthProfessional that corresponds to the received parameters (with a ' +
            'parameter to the populate (fields))', () => {
            it('should return an HealthProfessional array', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: { 'institution.id': defaultHealthProfessional.institution!.id },
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: defaultHealthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(healthProfessionalsArr)

                return healthProfessionalRepo.find(customQueryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no healthProfessional that corresponds to the received parameters', () => {
            it('should return an empty array', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012', type: UserType.HEALTH_PROFESSIONAL }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(new Array<HealthProfessionalMock>())

                return healthProfessionalRepo.find(queryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: '', type: UserType.HEALTH_PROFESSIONAL }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return healthProfessionalRepo.find(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findOne(query: IQuery)', () => {
        context('when there is a healthProfessional that corresponds to the received parameters', () => {
            it('should return the HealthProfessional that was found', () => {
                queryMock.filters = { _id: defaultHealthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultHealthProfessional)

                return healthProfessionalRepo.findOne(queryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultHealthProfessional.id)
                        assert.propertyVal(result, 'username', defaultHealthProfessional.username)
                        assert.propertyVal(result, 'password', defaultHealthProfessional.password)
                        assert.propertyVal(result, 'type', defaultHealthProfessional.type)
                        assert.propertyVal(result, 'scopes', defaultHealthProfessional.scopes)
                        assert.propertyVal(result, 'institution', defaultHealthProfessional.institution)
                        assert.propertyVal(result, 'children_groups', defaultHealthProfessional.children_groups)
                        assert.propertyVal(result, 'last_login', defaultHealthProfessional.last_login)
                    })
            })
        })

        context('when there is a healthProfessional that corresponds to the received parameters (with a parameter to the ' +
            'populate (fields))', () => {
            it('should return the HealthProfessional that was found', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: { 'institution.id': defaultHealthProfessional.institution!.id },
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: defaultHealthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultHealthProfessional)

                return healthProfessionalRepo.findOne(customQueryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultHealthProfessional.id)
                        assert.propertyVal(result, 'username', defaultHealthProfessional.username)
                        assert.propertyVal(result, 'password', defaultHealthProfessional.password)
                        assert.propertyVal(result, 'type', defaultHealthProfessional.type)
                        assert.propertyVal(result, 'scopes', defaultHealthProfessional.scopes)
                        assert.propertyVal(result, 'institution', defaultHealthProfessional.institution)
                        assert.propertyVal(result, 'children_groups', defaultHealthProfessional.children_groups)
                        assert.propertyVal(result, 'last_login', defaultHealthProfessional.last_login)
                    })
            })
        })

        context('when there is no healthProfessional that corresponds to the received parameters', () => {
            it('should return undefined', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012', type: UserType.HEALTH_PROFESSIONAL }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return healthProfessionalRepo.findOne(queryMock)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: '', type: UserType.HEALTH_PROFESSIONAL }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return healthProfessionalRepo.findOne(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('update(item: HealthProfessional)', () => {
        context('when the healthProfessional exists in the database', () => {
            it('should return the updated healthProfessional', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultHealthProfessional.id }, defaultHealthProfessional, { new: true })
                    .chain('exec')
                    .resolves(defaultHealthProfessional)

                return healthProfessionalRepo.update(defaultHealthProfessional)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultHealthProfessional.id)
                        assert.propertyVal(result, 'username', defaultHealthProfessional.username)
                        assert.propertyVal(result, 'password', defaultHealthProfessional.password)
                        assert.propertyVal(result, 'type', defaultHealthProfessional.type)
                        assert.propertyVal(result, 'scopes', defaultHealthProfessional.scopes)
                        assert.propertyVal(result, 'institution', defaultHealthProfessional.institution)
                        assert.propertyVal(result, 'children_groups', defaultHealthProfessional.children_groups)
                        assert.propertyVal(result, 'last_login', defaultHealthProfessional.last_login)
                    })
            })
        })

        context('when the healthProfessional is not found', () => {
            it('should return undefined', () => {

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultHealthProfessional.id }, defaultHealthProfessional, { new: true })
                    .chain('exec')
                    .resolves(undefined)

                return healthProfessionalRepo.update(defaultHealthProfessional)
                    .then((result: any) => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {

                defaultHealthProfessional.id = ''

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultHealthProfessional.id }, defaultHealthProfessional, { new: true })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return healthProfessionalRepo.update(defaultHealthProfessional)
                    .catch((err) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findById(healthProfessionalId: string)', () => {
        context('when there is a healthProfessional that corresponds to the received parameters', () => {
            it('should return the HealthProfessional that was found', () => {
                defaultHealthProfessional.id = '507f1f77bcf86cd799439011'
                queryMock.filters = { _id: defaultHealthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultHealthProfessional)

                return healthProfessionalRepo.findById(defaultHealthProfessional.id!)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultHealthProfessional.id)
                        assert.propertyVal(result, 'username', defaultHealthProfessional.username)
                        assert.propertyVal(result, 'password', defaultHealthProfessional.password)
                        assert.propertyVal(result, 'type', defaultHealthProfessional.type)
                        assert.propertyVal(result, 'scopes', defaultHealthProfessional.scopes)
                        assert.propertyVal(result, 'institution', defaultHealthProfessional.institution)
                        assert.propertyVal(result, 'children_groups', defaultHealthProfessional.children_groups)
                        assert.propertyVal(result, 'last_login', defaultHealthProfessional.last_login)
                    })
            })
        })

        context('when there is a healthProfessional that corresponds to the received parameters (with a parameter to the ' +
            'populate (fields))', () => {
            it('should return the HealthProfessional that was found', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: { 'institution.id': defaultHealthProfessional.institution!.id },
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: defaultHealthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultHealthProfessional)

                return healthProfessionalRepo.findById(defaultHealthProfessional.id!)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultHealthProfessional.id)
                        assert.propertyVal(result, 'username', defaultHealthProfessional.username)
                        assert.propertyVal(result, 'password', defaultHealthProfessional.password)
                        assert.propertyVal(result, 'type', defaultHealthProfessional.type)
                        assert.propertyVal(result, 'scopes', defaultHealthProfessional.scopes)
                        assert.propertyVal(result, 'institution', defaultHealthProfessional.institution)
                        assert.propertyVal(result, 'children_groups', defaultHealthProfessional.children_groups)
                        assert.propertyVal(result, 'last_login', defaultHealthProfessional.last_login)
                    })
            })
        })

        context('when there is no healthProfessional that corresponds to the received parameters', () => {
            it('should return undefined', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012', type: UserType.HEALTH_PROFESSIONAL }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return healthProfessionalRepo.findById(defaultHealthProfessional.id!)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultHealthProfessional.id = ''
                queryMock.filters = { _id: defaultHealthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return healthProfessionalRepo.findById(defaultHealthProfessional.id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('checkExists()', () => {
        context('when there is a healthProfessional with the id used', () => {
            it('should return true if exists in search by id', () => {
                defaultHealthProfessional.id = '507f1f77bcf86cd799439011'
                queryMock.filters = { _id: defaultHealthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves([ defaultHealthProfessional ])

                return healthProfessionalRepo.checkExist(defaultHealthProfessional)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the username is used as the search filter', () => {
            it('should return true if exists in search by username', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { type: UserType.HEALTH_PROFESSIONAL }
                        }
                    }
                }

                const healthProfessionalWithoutId = new HealthProfessional()
                healthProfessionalWithoutId.username = defaultHealthProfessional.username
                healthProfessionalWithoutId.type = defaultHealthProfessional.type

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves([ healthProfessionalWithoutId ])

                return healthProfessionalRepo.checkExist(healthProfessionalWithoutId)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when healthProfessional is not found', () => {
            it('should return false', () => {
                const customHealthProfessional = new HealthProfessional()
                customHealthProfessional.id = `${new ObjectID()}`
                customHealthProfessional.type = UserType.HEALTH_PROFESSIONAL

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: customHealthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves([])

                return healthProfessionalRepo.checkExist(customHealthProfessional)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: defaultHealthProfessional.id, type: UserType.HEALTH_PROFESSIONAL }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return healthProfessionalRepo.checkExist(defaultHealthProfessional)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('count()', () => {
        context('when there is at least one health professional in the database', () => {
            it('should return how many health professionals there are in the database', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .resolves(2)

                return healthProfessionalRepo.count()
                    .then((countHealthProfessionals: number) => {
                        assert.equal(countHealthProfessionals, 2)
                    })
            })
        })

        context('when there no are health professionals in database', () => {
            it('should return 0', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .resolves(0)

                return healthProfessionalRepo.count()
                    .then((countHealthProfessionals: number) => {
                        assert.equal(countHealthProfessionals, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return healthProfessionalRepo.count()
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('countChildrenGroups(healthProfessionalId: string)', () => {
        context('when there is at least one children group associated with the health professional received', () => {
            it('should return how many children groups are associated with such health professional in the database', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ _id: defaultHealthProfessional.id })
                    .chain('exec')
                    .resolves(defaultHealthProfessional)

                return healthProfessionalRepo.countChildrenGroups(defaultHealthProfessional.id!)
                    .then((countChildrenGroups: number) => {
                        assert.equal(countChildrenGroups, 2)
                    })
            })
        })

        context('when there no are children groups associated with the health professional received', () => {
            it('should return 0', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ _id: defaultHealthProfessional.id })
                    .chain('exec')
                    .resolves(new HealthProfessional())

                return healthProfessionalRepo.countChildrenGroups(defaultHealthProfessional.id!)
                    .then((countChildrenGroups: number) => {
                        assert.equal(countChildrenGroups, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ _id: defaultHealthProfessional.id })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return healthProfessionalRepo.countChildrenGroups(defaultHealthProfessional.id!)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
