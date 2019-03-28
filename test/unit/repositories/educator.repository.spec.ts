import sinon from 'sinon'
import { Institution } from '../../../src/application/domain/model/institution'
import { UserType } from '../../../src/application/domain/model/user'
import { Educator } from '../../../src/application/domain/model/educator'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { EducatorRepository } from '../../../src/infrastructure/repository/educator.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'
import { assert } from 'chai'
import { ObjectID } from 'bson'

require('sinon-mongoose')

describe('Repositories: Educator', () => {
    const institution: Institution = new Institution()
    institution.id = '5b13826de00324086854584b'
    institution.type = 'Any Type'
    institution.name = 'Name Example'
    institution.address = '221B Baker Street, St.'
    institution.latitude = 0
    institution.longitude = 0

    const defaultEducator: Educator = new Educator()
    defaultEducator.id = '5b13826de00324086854584b'
    defaultEducator.username = 'usertest'
    defaultEducator.password = 'userpass'
    defaultEducator.type = UserType.EDUCATOR
    defaultEducator.institution = institution
    defaultEducator.scopes = new Array<string>('i-can-everything')
    defaultEducator.children_groups = new Array<ChildrenGroup>()

    const modelFake: any = UserRepoModel
    const userRepo = new UserRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())
    const repo = new EducatorRepository(modelFake, new EntityMapperMock(), userRepo, new CustomLoggerMock())

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
                        filters: { _id: defaultEducator.id, type: UserType.EDUCATOR }
                    }
                }
            }

            sinon
                .mock(modelFake)
                .expects('findOne')
                .withArgs(customQueryMock.toJSON().filters)
                .chain('exec')
                .resolves(defaultEducator)

            return repo.checkExist(defaultEducator)
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
                        filters: { username: defaultEducator.username, type: UserType.EDUCATOR }
                    }
                }
            }

            const educatorWithoutId = new Educator()
            educatorWithoutId.username = defaultEducator.username
            educatorWithoutId.type = defaultEducator.type

            sinon
                .mock(modelFake)
                .expects('findOne')
                .withArgs(customQueryMock.toJSON().filters)
                .chain('exec')
                .resolves(defaultEducator)

            return repo.checkExist(educatorWithoutId)
                .then(result => {
                    assert.isBoolean(result)
                    assert.isTrue(result)
                })
        })

        context('when educator is not found', () => {
            it('should return false', () => {
                const customEducator = new Educator()
                customEducator.id = `${new ObjectID()}`
                customEducator.type = UserType.EDUCATOR

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: customEducator.id, type: UserType.EDUCATOR }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.checkExist(customEducator)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.isFalse(result)
                    })
            })
        })
    })
})
