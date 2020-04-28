import sinon from 'sinon'
import { User, UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { UserMock, UserTypeMock } from '../../mocks/user.mock'
import { assert } from 'chai'

require('sinon-mongoose')

describe('Repositories: User', () => {
    const defaultUser: User = new UserMock()
    defaultUser.password = 'user_password'
    defaultUser.type = UserType.ADMIN

    const otherUser: User = new UserMock(UserTypeMock.ADMIN)

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
        context('when the User does not have password', () => {
            it('should return an User without password', () => {
                defaultUser.password = undefined

                sinon
                    .mock(userModelFake)
                    .expects('create')
                    .withArgs(defaultUser)
                    .resolves(defaultUser)
                sinon
                    .mock(userModelFake)
                    .expects('findOne')
                    .withArgs({ _id: defaultUser.id })
                    .chain('exec')
                    .resolves(defaultUser)

                return userRepo.create(defaultUser)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultUser.id)
                        assert.propertyVal(result, 'username', defaultUser.username)
                        assert.isUndefined(result.password)
                        assert.propertyVal(result, 'type', defaultUser.type)
                        assert.propertyVal(result, 'institution', defaultUser.institution)
                        assert.propertyVal(result, 'last_login', defaultUser.last_login)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultUser.password = 'user_password'

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

    describe('changePassword(userId: string, old_password: string, new_password: string)', () => {
        context('when password is successfully changed', () => {
            it('should return true', () => {
                sinon
                    .mock(userModelFake)
                    .expects('findOne')
                    .withArgs({ _id: otherUser.id })
                    .chain('exec')
                    .resolves(defaultUser)
                sinon
                    .mock(userModelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: otherUser.id })
                    .chain('exec')
                    .resolves(true)

                return userRepo.changePassword(otherUser.id!, otherUser.password!, 'new_password')
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the old password does not match', () => {
            it('should throw a ValidationException', () => {
                sinon
                    .mock(userModelFake)
                    .expects('findOne')
                    .withArgs({ _id: otherUser.id })
                    .chain('exec')
                    .resolves(otherUser)

                return userRepo.changePassword(otherUser.id!, otherUser.password!, 'new_password')
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Password does not match!')
                        assert.propertyVal(err, 'description',
                            'The old password parameter does not match with the actual user password.')
                    })
            })
        })

        context('when a database error occurs in changePassword method', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(userModelFake)
                    .expects('findOne')
                    .withArgs({ _id: otherUser.id })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return userRepo.changePassword(otherUser.id!, otherUser.password!, 'new_password')
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('resetPassword(userId: string, new_password: string)', () => {
        context('when password is successfully reset', () => {
            it('should return true', () => {
                sinon
                    .mock(userModelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: otherUser.id })
                    .chain('exec')
                    .resolves(true)

                return userRepo.resetPassword(otherUser.id!, 'new_password')
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when there is no user with the id received', () => {
            it('should return false', () => {
                sinon
                    .mock(userModelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: otherUser.id })
                    .chain('exec')
                    .resolves(false)

                return userRepo.resetPassword(otherUser.id!, 'new_password')
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(userModelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: otherUser.id })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return userRepo.resetPassword(otherUser.id!, '')
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
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
                    .withArgs({ institution: defaultUser.institution!.id })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
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
                    .chain('exec')
                    .resolves(defaultUser)

                return userRepo.findById(defaultUser.id!)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultUser.id)
                        assert.propertyVal(result, 'username', defaultUser.username)
                        assert.propertyVal(result, 'password', defaultUser.password)
                        assert.propertyVal(result, 'type', defaultUser.type)
                        assert.propertyVal(result, 'institution', defaultUser.institution)
                        assert.propertyVal(result, 'last_login', defaultUser.last_login)
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

    describe('updateLastLogin(username: string)', () => {
        context('when last_login is successfully updated', () => {
            it('should return true', () => {
                defaultUser.id = '5a62be07de34500146d9c544'
                sinon
                    .mock(userModelFake)
                    .expects('find')
                    .withArgs()
                    .chain('exec')
                    .resolves([ defaultUser ])
                sinon
                    .mock(userModelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultUser.id })
                    .chain('exec')
                    .resolves(true)

                return userRepo.updateLastLogin(defaultUser.username!)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when none of the database users have username the same as the parameter passed', () => {
            it('should return false', () => {
                defaultUser.username = 'different_username'
                sinon
                    .mock(userModelFake)
                    .expects('find')
                    .withArgs()
                    .chain('exec')
                    .resolves([ new UserMock() ])
                sinon
                    .mock(userModelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultUser.id })
                    .chain('exec')
                    .resolves(false)

                return userRepo.updateLastLogin(defaultUser.username!)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when last_login is not updated successfully', () => {
            it('should return false', () => {
                defaultUser.id = ''
                sinon
                    .mock(userModelFake)
                    .expects('find')
                    .withArgs()
                    .chain('exec')
                    .resolves([ defaultUser ])
                sinon
                    .mock(userModelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultUser.id })
                    .chain('exec')
                    .resolves(false)

                return userRepo.updateLastLogin(defaultUser.username!)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultUser.id = '5a62be07de34500146d9c544'
                sinon
                    .mock(userModelFake)
                    .expects('find')
                    .withArgs()
                    .chain('exec')
                    .resolves([ defaultUser ])
                sinon
                    .mock(userModelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultUser.id })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return userRepo.updateLastLogin(defaultUser.username!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
