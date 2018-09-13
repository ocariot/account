import sinon from 'sinon'
import { Fitbit, IFitbit } from './../../../src/models/fitbit'
import { User, IUser } from './../../../src/models/user'
import { UserRepository } from '../../../src/repositories/user.repository';
import { FitibitProfileRepository } from '../../../src/repositories/fitbit.profile.repository';
import { assert } from 'chai'
import { IExceptionError } from '../../../src/exceptions/api.exception';

const FitbitProfileFake: any = Fitbit
const UserFake: any = User
const UserRepositoryFake: any = new UserRepository(UserFake)
const FitbitProfileRepositoryFake: any = FitibitProfileRepository

describe('Repositories: FitbitProfile', () => {

    const defaultUser: any = {
        _id: '5b13826de00324086854584a',
        name: 'Tristan J. Maya',
        date_birth: 10101994,
        created_at: '2018-06-01T00:27:48.605Z'
    }

    const defaultFitibitProfile: any = {
        user_id: "2342dfhrh56456786333edfsdf23334",
        access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1YWMyMzVmYWQ2YjQ2MDIzMzQzN2M0ZWQifQ.dnUUZfjt97fNG13y-o41ukg8ECQE-XHQ4LfCf_VKXHY",
        expires_in: 28800,
        refresh_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1YTk2ZmUzNmE3Yzk0ZDE0MGNlOGRmNzgifQ.TfsCOu0Ynhaq0P79VPvebMac8cA9b6lgZU7b4DJhq2k"
    }

    beforeEach(() => {
        sinon.stub(UserRepositoryFake, 'getById')

        sinon.stub(FitbitProfileFake, 'create')
        sinon.stub(FitbitProfileFake, 'find')
        sinon.stub(FitbitProfileFake, 'findOneAndDelete')

    })

    afterEach(() =>{
        UserRepositoryFake.getById.restore()

        FitbitProfileFake.create.restore()
        FitbitProfileFake.find.restore()
        FitbitProfileFake.findOneAndDelete.restore()


    })

    describe('save()', () => {
        it('should return the Fitbit profile saved', () => {
            let fitbitProfile: IFitbit = new Fitbit(defaultFitibitProfile)
                
            UserRepositoryFake.getById
                .withArgs(fitbitProfile.user_id)
                .resolves({})

            FitbitProfileFake.create
                .withArgs(fitbitProfile)
                .resolves(fitbitProfile)

            let fitbitProfileRepository = new FitibitProfileRepository(FitbitProfileFake, UserRepositoryFake)

            fitbitProfileRepository.save(fitbitProfile)
                .then((profile) => {
                    assert.equal(profile, fitbitProfile)
                })
        })

        context('When there are validation errors', () => {
            it('should return error 404 and message: Users not found!', () => {
                let fitbitProfile: IFitbit = new Fitbit(defaultFitibitProfile)
                
            UserRepositoryFake.getById
                .withArgs(fitbitProfile.user_id)
                .rejects({})

            FitbitProfileFake.create
                .withArgs(fitbitProfile)
                .resolves(fitbitProfile)

            let fitbitProfileRepository = new FitibitProfileRepository(FitbitProfileFake, UserRepositoryFake)

                return fitbitProfileRepository
                    .save(fitbitProfile).catch((err: IExceptionError) => {
                        assert.equal(err.code, 404)
                        assert.equal(err.message, 'User not found!')
                    })
            })

            it('should return error 400 for the user with missing required fields', () => {
                let fitbitProfile: IFitbit = new Fitbit(defaultFitibitProfile)
                
                UserRepositoryFake.getById
                    .withArgs(fitbitProfile.user_id)
                    .resolves({})

                FitbitProfileFake.create
                    .withArgs(fitbitProfile)
                    .rejects({name: 'ValidationError'})

                let fitbitProfileRepository = new FitibitProfileRepository(FitbitProfileFake, UserRepositoryFake)

                return fitbitProfileRepository
                    .save(fitbitProfile).catch((err: IExceptionError) => {
                        assert.equal(err.code, 400)
                        assert.equal(err.message, 'Required fields were not included!')
                    })
            })

            it('should return error 409 for the duplicate profile', () => {
                let fitbitProfile: IFitbit = new Fitbit(defaultFitibitProfile)
                
                UserRepositoryFake.getById
                    .withArgs(fitbitProfile.user_id)
                    .resolves({})

                FitbitProfileFake.create
                    .withArgs(fitbitProfile)
                    .rejects({code: 11000})

                let fitbitProfileRepository = new FitibitProfileRepository(FitbitProfileFake, UserRepositoryFake)

                return fitbitProfileRepository
                    .save(fitbitProfile).catch((err: IExceptionError) => {
                        assert.equal(err.code, 409)
                        assert.equal(err.message, 'Duplicate data is not allowed!')
                    })
            })
        })

    })

    describe('getAll()', () => {
        it('should return a list with all profiles', () => {
            let fitbitProfile: IFitbit = new Fitbit(defaultFitibitProfile)
            
            let params = {}
            
            FitbitProfileFake.find
                .withArgs(params)
                .resolves([fitbitProfile])
            
            let fitbitProfileRepository = new FitibitProfileRepository(FitbitProfileFake)
            
            return fitbitProfileRepository.getAll(params)
                .then((profile) => {
                    assert.deepStrictEqual(profile, [fitbitProfile])
                })
        })

        context('When there aren\'t  profiles', () => {
            it('should return error 404 and message: Fitibit Profiles not found!', () => {
                let fitbitProfile: IFitbit = new Fitbit(defaultFitibitProfile)
                
                let params = {}
                
                FitbitProfileFake.find
                    .withArgs(params)
                    .resolves([])
                
                let fitbitProfileRepository = new FitibitProfileRepository(FitbitProfileFake)
                
                return fitbitProfileRepository.getAll(params)
                    .catch((err: IExceptionError) => {
                        assert.equal(err.code, 404)
                        assert.equal(err.message, 'Profiles not found!')
                    })
            })

            it('should return error 400 and message: Invalid parameter!', () => {
                let fitbitProfile: IFitbit = new Fitbit(defaultFitibitProfile)
                
                let params = {}
                
                FitbitProfileFake.find
                    .withArgs(params)
                    .rejects({name: 'CastError'})
                
                let fitbitProfileRepository = new FitibitProfileRepository(FitbitProfileFake)
                
                return fitbitProfileRepository.getAll(params)
                    .catch((err: IExceptionError) => {
                        assert.equal(err.code, 400)
                        assert.equal(err.message, 'Invalid parameter!')
                    })
            })
        })
    })

    describe('delete()', () => {
        it('should return true, if the user was delete', () => {
            let fitbitProfile: IFitbit = new Fitbit(defaultFitibitProfile)

            FitbitProfileFake.findOneAndDelete
                .withArgs({user_id: defaultUser._id, _id: fitbitProfile._id})
                .resolves(fitbitProfile)
            
            let fitbitProfileRepository = new FitibitProfileRepository(FitbitProfileFake)
            
            return fitbitProfileRepository.delete(defaultUser._id, fitbitProfile._id)
                .then((result) => {
                    assert.deepStrictEqual(result, true)
                })
        })

        context("when the profile wasn't delete", () => {
            it('should return error 404 and message: Profile not found!', () => {
                let fitbitProfile: IFitbit = new Fitbit(defaultFitibitProfile)
                
                FitbitProfileFake.findOneAndDelete
                    .withArgs({_id: fitbitProfile._id, user_id: defaultUser._id})
                    .resolves(null)
                
                let fitbitProfileRepository = new FitibitProfileRepository(FitbitProfileFake)
                
                return fitbitProfileRepository.delete(defaultUser._id, fitbitProfile._id)
                    .catch((err: IExceptionError) => {
                        assert.equal(err.code, 404)
                        assert.equal(err.message, 'Profile not found!')
                    })
            })

            it('should return error 400 and message: Invalid parameter!', () => {
                let fitbitProfile: IFitbit = new Fitbit(defaultFitibitProfile)
                
                FitbitProfileFake.findOneAndDelete
                    .withArgs({_id: fitbitProfile._id, user_id: defaultUser._id})
                    .rejects({name: 'CastError'})
                
                let fitbitProfileRepository = new FitibitProfileRepository(FitbitProfileFake)
                
                return fitbitProfileRepository.delete(defaultUser._id, fitbitProfile._id)
                    .catch((err: IExceptionError) => {
                        assert.equal(err.code, 400)
                        assert.equal(err.message, 'Invalid parameter!')
                    })
            })
        })
    })

    describe('getById()', () =>{
        it('should return a list with one fitbit profile', () => {
            let fitbitProfile: IFitbit = new Fitbit(defaultFitibitProfile)
            
            FitbitProfileFake.find
                .withArgs(fitbitProfile.user_id)
                .resolves([fitbitProfile])
            
            let fitbitProfileRepository = new FitibitProfileRepository(FitbitProfileFake)
            
            return fitbitProfileRepository.getAll(fitbitProfile.user_id)
                .then((profile) => {
                    assert.equal(profile.length,[fitbitProfile].length)
                    assert.deepStrictEqual(profile, [fitbitProfile])
                })
        })

        context('When there aren\'t profile', () => {
            it('should return error 404 and message: Fitibit Profile not found!', () => {
                let fitbitProfile: IFitbit = new Fitbit(defaultFitibitProfile)
                
                let params = {user_id: fitbitProfile.user_id}

                FitbitProfileFake.find
                    .withArgs(params)
                    .resolves([])
                
                let fitbitProfileRepository = new FitibitProfileRepository(FitbitProfileFake)
                
                return fitbitProfileRepository.getById(params.user_id)
                    .catch((err: IExceptionError) => {
                        assert.equal(err.code, 404)
                        assert.equal(err.message, 'Fitbit Profile not found!')
                    })
            })

            it('should return error 400 and message: Invalid parameter!', () => {
                let fitbitProfile: IFitbit = new Fitbit(defaultFitibitProfile)
                
                let params = {user_id: fitbitProfile.user_id}
                
                FitbitProfileFake.find
                    .withArgs(params)
                    .rejects({name: 'CastError'})
                
                let fitbitProfileRepository = new FitibitProfileRepository(FitbitProfileFake)
                
                return fitbitProfileRepository.getById(params.user_id)
                    .catch((err: IExceptionError) => {
                        assert.equal(err.code, 400)
                        assert.equal(err.message, 'Invalid parameter!')
                    })
            })
        })
    })
})