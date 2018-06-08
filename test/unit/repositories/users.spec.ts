import sinon from 'sinon'
import { User, IUser } from './../../../src/models/user'
import { UserRepository } from '../../../src/repositories/user.repository';
import { assert } from 'chai'
import { IExceptionError } from '../../../src/exceptions/api.exception';

const UserFake: any = User

describe('Repositories: Users', () => {
    const defaultUser: any = {
        _id: '5b13826de00324086854584a',
        name: 'Tristan J. Maya',
        age: 18,
        created_at: '2018-06-01T00:27:48.605Z'
    }

    beforeEach(() => {
        sinon.stub(UserFake, 'find')
        sinon.stub(UserFake, 'findById')
        sinon.stub(UserFake, 'create')
    })

    afterEach(() => {
        UserFake.find.restore()
        UserFake.findById.restore()
        UserFake.create.restore()
    })

    describe('getAll()', () => {
        it('should return a list of users', () => {
            UserFake.find
                .withArgs({})
                .resolves([defaultUser])

            let userRepository = new UserRepository(UserFake)
            let resultExpected: Array<IUser> = [defaultUser]

            return userRepository
                .getAll().then((users) => {
                    assert.equal(users.length, resultExpected.length)
                    assert.equal(users[0], resultExpected[0])
                })
        })

        context('when there are no registered users', () => {
            it('should return error 404 and message: Users not found!', () => {
                UserFake.find
                    .withArgs({})
                    .resolves([])

                let userRepository = new UserRepository(User)
                let resultExpected: Array<IUser> = []

                return userRepository
                    .getAll().catch((err: IExceptionError) => {
                        assert.equal(err.code, 404)
                        assert.equal(err.message, 'Users not found!')
                    })
            })
        });
    })

    describe('getById()', () => {
        it('should return a user according to its ID', () => {
            UserFake.findById
                .withArgs(defaultUser._id)
                .resolves(defaultUser)

            let userRepository = new UserRepository(UserFake)

            return userRepository
                .getById(defaultUser._id)
                .then((user) => {
                    assert.isNotEmpty(user)
                    assert.equal(user, defaultUser)
                })
        })

        context('When the user is not found', () => {
            it('should return error 404 and message: User not found!', () => {
                UserFake.findById
                    .withArgs(defaultUser._id)
                    .resolves(null)

                let userRepository = new UserRepository(UserFake)

                return userRepository
                    .getById(defaultUser._id)
                    .catch((err: IExceptionError) => {
                        assert.equal(err.code, 404)
                        assert.equal(err.message, 'User not found!')
                    })
            })
        })

        context('when the user ID is not in the valid format', () => {
            it('should return error 400 and message: Invalid parameter!', () => {
                let invalidId: string = 'xxxx'
                UserFake.findById
                    .withArgs(invalidId)
                    .rejects({ name: 'CastError' })

                let userRepository = new UserRepository(UserFake)

                return userRepository
                    .getById(invalidId).catch((err: IExceptionError) => {
                        assert.equal(err.code, 400)
                        assert.equal(err.message, 'Invalid parameter!')
                    })
            })
        })
    })

    describe('save()', () => {
        it('should return the saved user', () => {
            let newUser: IUser = new User(defaultUser)

            UserFake.create
                .withArgs(newUser)
                .resolves(defaultUser)

            let userRepository = new UserRepository(UserFake)

            return userRepository
                .save(newUser)
                .then((user) => {
                    assert.isNotEmpty(user)
                    assert.equal(user, defaultUser)
                })
        })

        context('When there are validation errors', () => {
            it('should return error 400 for the user with missing required fields', () => {
                let newUser: IUser = new User({ age: 22 })
    
                UserFake.create
                    .withArgs(newUser)
                    .rejects({ name: 'ValidationError' })
    
                let userRepository = new UserRepository(UserFake)
    
                return userRepository
                    .save(newUser)
                    .catch((err: IExceptionError) => {
                        assert.equal(err.code, 400)
                        assert.equal(err.message, 'Required fields were not included!')
                    })
            })
    
            it('should return error 409 for the duplicate user', () => {
                let newUser: IUser = new User(defaultUser)
    
                UserFake.create
                    .withArgs(newUser)
                    .rejects({ code: 11000 })
    
                let userRepository = new UserRepository(UserFake)
    
                return userRepository
                    .save(newUser)
                    .catch((err: IExceptionError) => {
                        assert.equal(err.code, 409)
                        assert.equal(err.message, 'Duplicate data is not allowed!')
                    })
            })
        })
    })
})

