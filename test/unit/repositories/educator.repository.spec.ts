import sinon from 'sinon'
import { UserType } from '../../../src/application/domain/model/user'
import { Educator } from '../../../src/application/domain/model/educator'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { EducatorRepository } from '../../../src/infrastructure/repository/educator.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'
import { assert } from 'chai'
import { ObjectID } from 'bson'
import { EducatorMock } from '../../mocks/educator.mock'
import { Query } from '../../../src/infrastructure/repository/query/query'

require('sinon-mongoose')

describe('Repositories: Educator', () => {
    const defaultEducator: Educator = new EducatorMock()
    defaultEducator.id = '507f1f77bcf86cd799439011'
    defaultEducator.password = 'educator_password'

    // Mock educator array
    const educatorsArr: Array<Educator> = new Array<EducatorMock>()
    for (let i = 0; i < 3; i++) {
        educatorsArr.push(new EducatorMock())
    }

    const modelFake: any = UserRepoModel
    const userRepo = new UserRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())
    const educatorRepo = new EducatorRepository(modelFake, new EntityMapperMock(), userRepo, new CustomLoggerMock())

    // Mock query
    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: { _id: defaultEducator.id, type: UserType.EDUCATOR }
            }
        }
    }

    afterEach(() => {
        sinon.restore()
    })

    describe('create(item: Educator)', () => {
        context('when the Educator does not have password', () => {
            it('should return an Educator without password', () => {
                defaultEducator.password = undefined

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(defaultEducator)
                    .resolves(defaultEducator)
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ _id: defaultEducator.id })
                    .chain('exec')
                    .resolves(defaultEducator)

                return educatorRepo.create(defaultEducator)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultEducator.id)
                        assert.propertyVal(result, 'username', defaultEducator.username)
                        assert.isUndefined(result.password)
                        assert.propertyVal(result, 'type', defaultEducator.type)
                        assert.propertyVal(result, 'scopes', defaultEducator.scopes)
                        assert.propertyVal(result, 'institution', defaultEducator.institution)
                        assert.propertyVal(result, 'children_groups', defaultEducator.children_groups)
                        assert.propertyVal(result, 'last_login', defaultEducator.last_login)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultEducator.password = 'educator_password'

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(defaultEducator)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return educatorRepo.create(defaultEducator)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findAll(query: IQuery)', () => {
        const query: Query = new Query()
        query.ordination = new Map()
        context('when there is at least one educator that corresponds to the received parameters', () => {
            it('should return an Educator array', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('sort')
                    .withArgs({})
                    .chain('skip')
                    .withArgs(0)
                    .chain('limit')
                    .withArgs(query.pagination.limit)
                    .chain('exec')
                    .resolves(educatorsArr)

                return educatorRepo.findAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no educator that corresponds to the received parameters', () => {
            it('should return an empty array', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('sort')
                    .withArgs({})
                    .chain('skip')
                    .withArgs(0)
                    .chain('limit')
                    .withArgs(query.pagination.limit)
                    .chain('exec')
                    .resolves(new Array<EducatorMock>())

                return educatorRepo.findAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('sort')
                    .withArgs({})
                    .chain('skip')
                    .withArgs(0)
                    .chain('limit')
                    .withArgs(query.pagination.limit)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return educatorRepo.findAll(query)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findOne(query: IQuery)', () => {
        context('when there is an educator that corresponds to the received parameters', () => {
            it('should return the Educator that was found', () => {
                queryMock.filters = { _id: defaultEducator.id, type: UserType.EDUCATOR }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultEducator)

                return educatorRepo.findOne(queryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultEducator.id)
                        assert.propertyVal(result, 'username', defaultEducator.username)
                        assert.propertyVal(result, 'password', defaultEducator.password)
                        assert.propertyVal(result, 'type', defaultEducator.type)
                        assert.propertyVal(result, 'scopes', defaultEducator.scopes)
                        assert.propertyVal(result, 'institution', defaultEducator.institution)
                        assert.propertyVal(result, 'children_groups', defaultEducator.children_groups)
                        assert.propertyVal(result, 'last_login', defaultEducator.last_login)
                    })
            })
        })

        context('when there is no educator that corresponds to the received parameters', () => {
            it('should return undefined', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012', type: UserType.EDUCATOR }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return educatorRepo.findOne(queryMock)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: '', type: UserType.EDUCATOR }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return educatorRepo.findOne(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('update(item: Educator)', () => {
        context('when the educator exists in the database', () => {
            it('should return the updated educator', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultEducator.id }, defaultEducator, { new: true })
                    .chain('exec')
                    .resolves(defaultEducator)

                return educatorRepo.update(defaultEducator)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultEducator.id)
                        assert.propertyVal(result, 'username', defaultEducator.username)
                        assert.propertyVal(result, 'password', defaultEducator.password)
                        assert.propertyVal(result, 'type', defaultEducator.type)
                        assert.propertyVal(result, 'scopes', defaultEducator.scopes)
                        assert.propertyVal(result, 'institution', defaultEducator.institution)
                        assert.propertyVal(result, 'children_groups', defaultEducator.children_groups)
                        assert.propertyVal(result, 'last_login', defaultEducator.last_login)
                    })
            })
        })

        context('when the educator is not found', () => {
            it('should return undefined', () => {

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultEducator.id }, defaultEducator, { new: true })
                    .chain('exec')
                    .resolves(undefined)

                return educatorRepo.update(defaultEducator)
                    .then((result: any) => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {

                defaultEducator.id = ''

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultEducator.id }, defaultEducator, { new: true })
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return educatorRepo.update(defaultEducator)
                    .catch((err) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findById(educatorId: string)', () => {
        context('when there is an educator that corresponds to the received parameters', () => {
            it('should return the Educator that was found', () => {
                defaultEducator.id = '507f1f77bcf86cd799439011'
                queryMock.filters = { _id: defaultEducator.id, type: UserType.EDUCATOR }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultEducator)

                return educatorRepo.findById(defaultEducator.id!)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultEducator.id)
                        assert.propertyVal(result, 'username', defaultEducator.username)
                        assert.propertyVal(result, 'password', defaultEducator.password)
                        assert.propertyVal(result, 'type', defaultEducator.type)
                        assert.propertyVal(result, 'scopes', defaultEducator.scopes)
                        assert.propertyVal(result, 'institution', defaultEducator.institution)
                        assert.propertyVal(result, 'children_groups', defaultEducator.children_groups)
                        assert.propertyVal(result, 'last_login', defaultEducator.last_login)
                    })
            })
        })

        context('when there is no educator that corresponds to the received parameters', () => {
            it('should return undefined', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012', type: UserType.EDUCATOR }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return educatorRepo.findById(defaultEducator.id!)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultEducator.id = ''
                queryMock.filters = { _id: '', type: UserType.EDUCATOR }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return educatorRepo.findById(defaultEducator.id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('checkExists()', () => {
        context('when there is an educator with the id used', () => {
            it('should return true if exists in search by id', () => {
                defaultEducator.id = '507f1f77bcf86cd799439011'
                queryMock.filters = { _id: defaultEducator.id, type: UserType.EDUCATOR }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves([defaultEducator])

                return educatorRepo.checkExist(defaultEducator)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the username is used as the search filter', () => {
            it('should return true if exists in search by username', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { type: UserType.EDUCATOR }
                        }
                    }
                }

                const educatorWithoutId = new Educator()
                educatorWithoutId.username = defaultEducator.username
                educatorWithoutId.type = defaultEducator.type

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves([educatorWithoutId])

                return educatorRepo.checkExist(educatorWithoutId)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when educator is not found', () => {
            it('should return false', () => {
                const customEducator = new Educator()
                customEducator.id = `${new ObjectID()}`
                customEducator.type = UserType.EDUCATOR

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: customEducator.id, type: UserType.EDUCATOR }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves([])

                return educatorRepo.checkExist(customEducator)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: defaultEducator.id, type: UserType.EDUCATOR }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return educatorRepo.checkExist(defaultEducator)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('count()', () => {
        context('when there is at least one educator in the database', () => {
            it('should return how many educators there are in the database', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .resolves(2)

                return educatorRepo.count()
                    .then((countEducators: number) => {
                        assert.equal(countEducators, 2)
                    })
            })
        })

        context('when there no are educators in database', () => {
            it('should return 0', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .resolves(0)

                return educatorRepo.count()
                    .then((countEducators: number) => {
                        assert.equal(countEducators, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs()
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return educatorRepo.count()
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('countChildrenGroups(educatorId: string)', () => {
        context('when there is at least one children group associated with the educator received', () => {
            it('should return how many children groups are associated with such educator in the database', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ _id: defaultEducator.id, type: UserType.EDUCATOR })
                    .chain('exec')
                    .resolves(defaultEducator)

                return educatorRepo.countChildrenGroups(defaultEducator.id!)
                    .then((countChildrenGroups: number) => {
                        assert.equal(countChildrenGroups, 2)
                    })
            })
        })

        context('when there no are children groups associated with the educator received', () => {
            it('should return 0', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ _id: defaultEducator.id, type: UserType.EDUCATOR })
                    .chain('exec')
                    .resolves(new Educator())

                return educatorRepo.countChildrenGroups(defaultEducator.id!)
                    .then((countChildrenGroups: number) => {
                        assert.equal(countChildrenGroups, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ _id: defaultEducator.id, type: UserType.EDUCATOR })
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return educatorRepo.countChildrenGroups(defaultEducator.id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findEducatorsByChildId(childId: string)', () => {
        context('when there is at least one educator associated with the childId received', () => {
            it('should return an array with one educator that has an association with the given childId',
                () => {
                    sinon
                        .mock(modelFake)
                        .expects('find')
                        .withArgs({ type: UserType.EDUCATOR })
                        .chain('exec')
                        .resolves([new EducatorMock(), defaultEducator])

                    return educatorRepo.findEducatorsByChildId(defaultEducator.children_groups![0].children![0].id!)
                        .then((result: Array<Educator>) => {
                            assert.equal(result.length, 1)
                        })
                })
        })

        context('when there no are educator associated with the childId received', () => {
            it('should return an empty array because no educator has an association with the given childId', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs({ type: UserType.EDUCATOR })
                    .chain('exec')
                    .resolves([new EducatorMock(), defaultEducator, new EducatorMock()])

                return educatorRepo.findEducatorsByChildId('5a62be07d6233300146c9b32')
                    .then((result: Array<Educator>) => {
                        assert.equal(result.length, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs({ type: UserType.EDUCATOR })
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return educatorRepo.findEducatorsByChildId('5a62be07d6233300146c9b32')
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
