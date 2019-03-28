import sinon from 'sinon'
import { Institution } from '../../../src/application/domain/model/institution'
import { UserType } from '../../../src/application/domain/model/user'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { HealthProfessional } from '../../../src/application/domain/model/health.professional'
import { HealthProfessionalRepository } from '../../../src/infrastructure/repository/health.professional.repository'
import { assert } from 'chai'
import { ObjectID } from 'bson'

require('sinon-mongoose')

describe('Repositories: HealthProfessional', () => {
    const institution: Institution = new Institution()
    institution.id = '5b13826de00324086854584b'
    institution.type = 'Any Type'
    institution.name = 'Name Example'
    institution.address = '221B Baker Street, St.'
    institution.latitude = 0
    institution.longitude = 0

    const defaultHealthProfessional: HealthProfessional = new HealthProfessional()
    defaultHealthProfessional.id = '5b13826de00324086854584b'
    defaultHealthProfessional.username = 'usertest'
    defaultHealthProfessional.password = 'userpass'
    defaultHealthProfessional.type = UserType.HEALTH_PROFESSIONAL
    defaultHealthProfessional.institution = institution
    defaultHealthProfessional.scopes = new Array<string>('i-can-everything')
    defaultHealthProfessional.children_groups = new Array<ChildrenGroup>()

    const modelFake: any = UserRepoModel
    const userRepo = new UserRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())
    const repo = new HealthProfessionalRepository(modelFake, new EntityMapperMock(), userRepo, new CustomLoggerMock())

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

            return repo.checkExist(defaultHealthProfessional)
                .then(result => {
                    assert.isBoolean(result)
                    assert.isTrue(result)
                })
        })

        it('should return true if exists in search by username', () => {
            const customQueryMock: any = {
                toJSON: () => {
                    return {
                        fields: {},
                        ordination: {},
                        pagination: { page: 1, limit: 100, skip: 0 },
                        filters: { username: defaultHealthProfessional.username, type: UserType.HEALTH_PROFESSIONAL }
                    }
                }
            }

            const healthProfessionalWithoutId = new HealthProfessional()
            healthProfessionalWithoutId.username = defaultHealthProfessional.username
            healthProfessionalWithoutId.type = defaultHealthProfessional.type

            sinon
                .mock(modelFake)
                .expects('findOne')
                .withArgs(customQueryMock.toJSON().filters)
                .chain('exec')
                .resolves(defaultHealthProfessional)

            return repo.checkExist(healthProfessionalWithoutId)
                .then(result => {
                    assert.isBoolean(result)
                    assert.isTrue(result)
                })
        })

        context('when health professional is not found', () => {
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
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.checkExist(customHealthProfessional)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.isFalse(result)
                    })
            })
        })
    })
})
