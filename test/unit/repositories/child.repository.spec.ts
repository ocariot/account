import { Institution } from '../../../src/application/domain/model/institution'
import { UserType } from '../../../src/application/domain/model/user'
import { Child } from '../../../src/application/domain/model/child'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { ChildRepository } from '../../../src/infrastructure/repository/child.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'

require('sinon-mongoose')

describe('Repositories: Child', () => {
    const institution: Institution = new Institution()
    institution.id = '5b13826de00324086854584b'
    institution.type = 'Any Type'
    institution.name = 'Name Example'
    institution.address = '221B Baker Street, St.'
    institution.latitude = 0
    institution.longitude = 0

    const defaultChild: Child = new Child()
    defaultChild.id = '5b13826de00324086854584b'
    defaultChild.username = 'usertest'
    defaultChild.password = 'userpass'
    defaultChild.type = UserType.CHILD
    defaultChild.institution = institution
    defaultChild.scopes = new Array<string>('i-can-everything')
    defaultChild.age = 13
    defaultChild.gender = 'male'

    const modelFake: any = UserRepoModel
    const userRepo = new UserRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())
    const repo = new ChildRepository(modelFake, new EntityMapperMock(), userRepo, new CustomLoggerMock())

    // TODO implement checkExist test
    describe('checkExist()', () => {
        it('Not implemented yet.', () => {
            return repo
        })
    })

})
