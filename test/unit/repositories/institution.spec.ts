import sinon from 'sinon'
import { Institution } from '../../../src/application/domain/model/institution'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { InstitutionRepository } from '../../../src/infrastructure/repository/institution.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { UserType } from '../../../src/application/domain/model/user'
import { assert } from 'chai'
import { ObjectID } from 'bson'

require('sinon-mongoose')

describe('Repositories: Institution', () => {
    const defaultInstitution: Institution = new Institution()
    defaultInstitution.id = '5b13826de00324086854584b'
    defaultInstitution.type = 'Any Type'
    defaultInstitution.name = 'Name Example'
    defaultInstitution.address = '221B Baker Street, St.'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const modelFake = InstitutionRepoModel
    const repo = new InstitutionRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

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
                .resolves(defaultInstitution)

            return repo.checkExist(defaultInstitution)
                .then(result => {
                    assert.isBoolean(result)
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
                .resolves(defaultInstitution)

            return repo.checkExist(institutionWithoutId)
                .then(result => {
                    assert.isBoolean(result)
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
                    .resolves(undefined)

                return repo.checkExist(customInstitution)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.isFalse(result)
                    })
            })
        })
    })
})
