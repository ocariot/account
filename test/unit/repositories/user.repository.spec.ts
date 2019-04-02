import sinon from 'sinon'
import { User, UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { UserMock } from '../../mocks/user.mock'
import { assert } from 'chai'

require('sinon-mongoose')

describe('Repositories: User', () => {
    const defaultUser: User = new UserMock()
    defaultUser.id = '507f1f77bcf86cd799439011'
    defaultUser.username = 'username'
    defaultUser.password = 'user_password'
    defaultUser.type = UserType.ADMIN
    defaultUser.scopes = new Array<string>('i-can-everything')

    const userModelFake: any = UserRepoModel
    const userRepo = new UserRepository(userModelFake, new EntityMapperMock(), new CustomLoggerMock())

    afterEach(() => {
        sinon.restore()
    })

    describe('create(item: User)', () => {
        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(userModelFake)
                    .expects('create')
                    .withArgs(defaultUser)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return userRepo.create(defaultUser)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('encryptPassword(password: string)', () => {
        it('should return an encrypted string', () => {
            const lengthEncryptedString: number = (userRepo.encryptPassword(defaultUser.password!)).length
            assert.equal(lengthEncryptedString, 60)
        })
    })

    // TODO implement changePassword test
    describe('changePassword(userId: string, old_password: string, new_password: string)', () => {
        it('Not implemented yet', () => {
            return userRepo
        })
    })

    // TODO implement hasInstitution test
    describe('hasInstitution(institutionId: string)', () => {
        it('Not implemented yet', () => {
            return userRepo
        })
    })
})
