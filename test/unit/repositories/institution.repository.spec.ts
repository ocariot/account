import sinon from 'sinon'
import { Institution } from '../../../src/application/domain/model/institution'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { InstitutionRepository } from '../../../src/infrastructure/repository/institution.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { UserType } from '../../../src/application/domain/model/user'
import { assert } from 'chai'
import { ObjectID } from 'bson'
import { InstitutionMock } from '../../mocks/institution.mock'

require('sinon-mongoose')

describe('Repositories: Institution', () => {
    const defaultInstitution: Institution = new InstitutionMock()

    const modelFake = InstitutionRepoModel
    const institutionRepo = new InstitutionRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    afterEach(() => {
        sinon.restore()
    })

    describe('checkExists()', () => {
        it('should return true if exists in search by id', () => {
            const customQueryMock: any = {
                toJSON: () => {
                    return {
                        fields: {},
                        ordination: {},
                        pagination: { page: 1, limit: 100, skip: 0 },
                        filters: { _id: defaultInstitution.id }
                    }
                }
            }

            sinon
                .mock(modelFake)
                .expects('findOne')
                .withArgs(customQueryMock.toJSON().filters)
                .chain('exec')
                .resolves(true)

            return institutionRepo.checkExist(defaultInstitution)
                .then(result => {
                    assert.isTrue(result)
                })
        })

        it('should return true if exists in search by name', () => {
            const customQueryMock: any = {
                toJSON: () => {
                    return {
                        fields: {},
                        ordination: {},
                        pagination: { page: 1, limit: 100, skip: 0 },
                        filters: { name: defaultInstitution.name }
                    }
                }
            }

            const institutionWithoutId = new Institution()
            institutionWithoutId.name = defaultInstitution.name

            sinon
                .mock(modelFake)
                .expects('findOne')
                .withArgs(customQueryMock.toJSON().filters)
                .chain('exec')
                .resolves(true)

            return institutionRepo.checkExist(institutionWithoutId)
                .then(result => {
                    assert.isTrue(result)
                })
        })

        context('when institution is not found', () => {
            it('should return false', () => {
                const customInstitution = new Institution()
                customInstitution.id = `${new ObjectID()}`
                customInstitution.type = UserType.EDUCATOR

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: customInstitution.id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(false)

                return institutionRepo.checkExist(customInstitution)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', async () => {
                const customInstitution = new Institution()
                customInstitution.id = `${new ObjectID()}`
                customInstitution.type = UserType.EDUCATOR

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: customInstitution.id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                try {
                    await institutionRepo.checkExist(customInstitution)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                    assert.propertyVal(err, 'description', 'Please try again later...')
                }
            })
        })
    })

    describe('count()', () => {
        context('when there is at least one institution in the database', () => {
            it('should return how many institutions there are in the database', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .resolves(2)

                return institutionRepo.count()
                    .then((countInstitutions: number) => {
                        assert.equal(countInstitutions, 2)
                    })
            })
        })

        context('when there no are institutions in database', () => {
            it('should return 0', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .resolves(0)

                return institutionRepo.count()
                    .then((countInstitutions: number) => {
                        assert.equal(countInstitutions, 0)
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

                return institutionRepo.count()
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
