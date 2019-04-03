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

    // Mock query
    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: { _id: defaultUser.id }
            }
        }
    }

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

    describe('hasInstitution(institutionId: string)', () => {
        context('when there is an Institution associated with one or more users', () => {
            it('should return true', () => {
                sinon
                    .mock(userModelFake)
                    .expects('countDocuments')
                    .withArgs({ institution: defaultUser.institution!.id })
                    .chain('exec')
                    .resolves(1)

                return userRepo.hasInstitution(defaultUser.institution!.id!)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when there is no Institution associated with one or more users', () => {
            it('should return true', () => {
                sinon
                    .mock(userModelFake)
                    .expects('countDocuments')
                    .withArgs({ institution: defaultUser.institution!.id })
                    .chain('exec')
                    .resolves(0)

                return userRepo.hasInstitution(defaultUser.institution!.id!)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(userModelFake)
                    .expects('countDocuments')
                    .withArgs({ institution: '123' })
                    .chain('exec')
                    .resolves({ message: 'An internal error has occurred in the database!',
                                description: 'Please try again later...' })

                return userRepo.hasInstitution(defaultUser.institution!.id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findById(userId: string)', () => {
        context('when there is an user that corresponds to the received parameters', () => {
            it('should return the User that was found', () => {
                sinon
                    .mock(userModelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('select')
                    .withArgs(queryMock.toJSON().fields)
                    .chain('exec')
                    .resolves(defaultUser)

                return userRepo.findById(defaultUser.id!)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultUser.id)
                        assert.propertyVal(result, 'username', defaultUser.username)
                        assert.propertyVal(result, 'password', defaultUser.password)
                        assert.propertyVal(result, 'type', defaultUser.type)
                        assert.propertyVal(result, 'scopes', defaultUser.scopes)
                        assert.propertyVal(result, 'institution', defaultUser.institution)
                    })
            })
        })

        context('when there is no user that corresponds to the received parameters', () => {
            it('should return undefined', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012' }

                sinon
                    .mock(userModelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return userRepo.findById(defaultUser.id!)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultUser.id = ''
                queryMock.filters = { _id: defaultUser.id }

                sinon
                    .mock(userModelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return userRepo.findById(defaultUser.id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
