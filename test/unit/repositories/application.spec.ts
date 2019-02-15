import sinon from 'sinon'
import { assert } from 'chai'
import { ApplicationRepository } from '../../../src/infrastructure/repository/application.repository'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { IApplicationRepository } from '../../../src/application/port/application.repository.interface'
import { Application } from '../../../src/application/domain/model/application'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { Institution } from '../../../src/application/domain/model/institution'
import { UserType } from '../../../src/application/domain/model/user'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { ObjectID } from 'bson'

require('sinon-mongoose')

describe('Repositories: Application', () => {
    const institution: Institution = new Institution()
    institution.id = '5b13826de00324086854584b'
    institution.type = 'Any Type'
    institution.name = 'Name Example'
    institution.address = '221B Baker Street, St.'
    institution.latitude = 0
    institution.longitude = 0

    const defaultApplication: Application = new Application()
    defaultApplication.id = '5b13826de00324086854584a'
    defaultApplication.username = 'application'
    defaultApplication.password = 'mysecretkey'
    defaultApplication.application_name = 'application test'
    defaultApplication.institution = institution
    defaultApplication.type = UserType.APPLICATION
    defaultApplication.scopes = new Array<string>('readonly')

    const modelFake: any = UserRepoModel
    const userRepo = new UserRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())
    const repo: IApplicationRepository =
        new ApplicationRepository(modelFake, new EntityMapperMock(), userRepo, new CustomLoggerMock())

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
                        filters: { _id: defaultApplication.id, type: UserType.APPLICATION }
                    }
                }
            }

            sinon
                .mock(modelFake)
                .expects('findOne')
                .withArgs(customQueryMock.toJSON().filters)
                .chain('exec')
                .resolves(defaultApplication)

            return repo.checkExist(defaultApplication)
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
                        filters: { username: defaultApplication.username, type: UserType.APPLICATION }
                    }
                }
            }

            const appWithoutId = new Application()
            appWithoutId.username = defaultApplication.username
            appWithoutId.type = defaultApplication.type

            sinon
                .mock(modelFake)
                .expects('findOne')
                .withArgs(customQueryMock.toJSON().filters)
                .chain('exec')
                .resolves(defaultApplication)

            return repo.checkExist(appWithoutId)
                .then(result => {
                    assert.isBoolean(result)
                    assert.isTrue(result)
                })
        })

        context('when application is not found', () => {
            it('should return false', () => {
                const customApp = new Application()
                customApp.id = `${new ObjectID()}`
                customApp.type = UserType.APPLICATION

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: customApp.id, type: UserType.APPLICATION }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.checkExist(customApp)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.isFalse(result)
                    })
            })
        })
    })

})
