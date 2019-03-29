import { assert } from 'chai'
import sinon from 'sinon'
import { User, UserType } from '../../../src/application/domain/model/user'
import { AuthRepository } from '../../../src/infrastructure/repository/auth.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { Institution } from '../../../src/application/domain/model/institution'
import { UserRepositoryMock } from '../../mocks/user.repository.mock'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'

require('sinon-mongoose')

describe('Repositories: AuthRepository', () => {
    const institution: Institution = new Institution()
    institution.id = '5b13826de00324086854584b'
    institution.type = 'Any Type'
    institution.name = 'Name Example'
    institution.address = '221B Baker Street, St.'
    institution.latitude = 0
    institution.longitude = 0

    const user: User = new User()
    user.id = '5b13826de00324086854584b'
    user.username = 'usertest'
    user.password = 'userpass'
    user.type = UserType.ADMIN
    user.institution = institution
    user.scopes = new Array<string>('i-can-everything')

    const modelFake: any = UserRepoModel
    const userRepo = new UserRepositoryMock()
    const repo = new AuthRepository(modelFake, new EntityMapperMock(), userRepo, new CustomLoggerMock())

    afterEach(() => {
        sinon.restore()
    })

    describe('authenticate()', () => {
        it('should return the access token', () => {
            sinon
                .mock(modelFake)
                .expects('findOne')
                .withArgs({ username: user.username })
                .chain('exec')
                .resolves(user)

            return repo.authenticate('usertest', 'userpass')
                .then(result => {
                    assert.isNotNull(result)
                    assert.property(result, 'access_token')
                })
        })

        context('when the user is not found', () => {
            it('should return undefined', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ username: user.username })
                    .chain('exec')
                    .resolves(undefined)

                return repo.authenticate('usertest', 'userpass')
                    .then(result => {
                        assert.equal(result, undefined)
                    })
            })
        })

        context('when the user is not found', () => {
            it('should return the access token', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ username: user.username })
                    .chain('exec')
                    .resolves(user)

                return repo.authenticate('usertest', 'userpass')
                    .then(result => {
                        assert.isNotNull(result)
                        assert.property(result, 'access_token')
                    })
            })
        })
    })

})
