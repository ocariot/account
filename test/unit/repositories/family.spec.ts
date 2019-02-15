import sinon from 'sinon'
import { Institution } from '../../../src/application/domain/model/institution'
import { Family } from '../../../src/application/domain/model/family'
import { UserType } from '../../../src/application/domain/model/user'
import { Child } from '../../../src/application/domain/model/child'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { FamilyRepository } from '../../../src/infrastructure/repository/family.repository'
import { assert } from 'chai'
import { ObjectID } from 'bson'

require('sinon-mongoose')

describe('Repositories: Family', () => {
    const institution: Institution = new Institution()
    institution.id = '5b13826de00324086854584b'
    institution.type = 'Any Type'
    institution.name = 'Name Example'
    institution.address = '221B Baker Street, St.'
    institution.latitude = 0
    institution.longitude = 0

    const defaultFamily: Family = new Family()
    defaultFamily.id = '5b13826de00324086854584b'
    defaultFamily.username = 'usertest'
    defaultFamily.password = 'userpass'
    defaultFamily.type = UserType.FAMILY
    defaultFamily.institution = institution
    defaultFamily.scopes = new Array<string>('i-can-everything')
    defaultFamily.children = new Array<Child>()

    const modelFake: any = UserRepoModel
    const userRepo = new UserRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())
    const repo = new FamilyRepository(modelFake, new EntityMapperMock(), userRepo, new CustomLoggerMock())

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
                        filters: { _id: defaultFamily.id, type: UserType.FAMILY }
                    }
                }
            }

            sinon
                .mock(modelFake)
                .expects('findOne')
                .withArgs(customQueryMock.toJSON().filters)
                .chain('exec')
                .resolves(defaultFamily)

            return repo.checkExist(defaultFamily)
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
                        filters: { username: defaultFamily.username, type: UserType.FAMILY }
                    }
                }
            }

            const familyWithoutId = new Family()
            familyWithoutId.username = defaultFamily.username
            familyWithoutId.type = defaultFamily.type

            sinon
                .mock(modelFake)
                .expects('findOne')
                .withArgs(customQueryMock.toJSON().filters)
                .chain('exec')
                .resolves(defaultFamily)

            return repo.checkExist(familyWithoutId)
                .then(result => {
                    assert.isBoolean(result)
                    assert.isTrue(result)
                })
        })

        context('when educator is not found', () => {
            it('should return false', () => {
                const customFamily = new Family()
                customFamily.id = `${new ObjectID()}`
                customFamily.type = UserType.FAMILY

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: customFamily.id, type: UserType.FAMILY }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.checkExist(customFamily)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.isFalse(result)
                    })
            })
        })
    })

    // TODO implement disassociateChildFromFamily test
    describe('disassociateChildFromFamily()', () => {
        it('Not implemented yet.', () => {
            return
        })
    })
})
