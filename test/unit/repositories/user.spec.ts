import sinon from 'sinon'
import { Institution } from '../../../src/application/domain/model/institution'
import { User, UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'

describe('Repositories: User', () => {
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
    const repo = new UserRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    afterEach(() => {
        sinon.restore()
    })

    // TODO implement changePassword test
    describe('changePassword()', () => {
        it('Not implemented yet', () => {
            return repo
        })
    })

    // TODO implement hasInstitution test
    describe('hasInstitution()', () => {
        it('Not implemented yet', () => {
            return repo
        })
    })
})
