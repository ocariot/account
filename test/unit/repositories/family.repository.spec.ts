import sinon from 'sinon'
import { Family } from '../../../src/application/domain/model/family'
import { UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { UserRepository } from '../../../src/infrastructure/repository/user.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { FamilyRepository } from '../../../src/infrastructure/repository/family.repository'
import { assert } from 'chai'
import { ObjectID } from 'bson'
import { FamilyMock } from '../../mocks/family.mock'

require('sinon-mongoose')

describe('Repositories: Family', () => {
    const defaultFamily: Family = new FamilyMock()
    defaultFamily.id = '507f1f77bcf86cd799439011'
    defaultFamily.password = 'family_password'

    const modelFake: any = UserRepoModel
    const userRepo = new UserRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())
    const familyRepo = new FamilyRepository(modelFake, new EntityMapperMock(), userRepo, new CustomLoggerMock())

    // Mock families array
    const familiesArr: Array<Family> = new Array<FamilyMock>()
    for (let i = 0; i < 3; i++) {
        familiesArr.push(new FamilyMock())
    }

    // Mock query
    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: { _id: defaultFamily.id, type: UserType.FAMILY }
            }
        }
    }

    afterEach(() => {
        sinon.restore()
    })

    describe('create(item: Family)', () => {

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(defaultFamily)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return familyRepo.create(defaultFamily)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('find(query: IQuery)', () => {
        context('when there is at least one family that corresponds to the received parameters', () => {
            it('should return an Family array', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(familiesArr)

                return familyRepo.find(queryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is at least one family that corresponds to the received parameters (with a parameter to the ' +
            'populate (fields))', () => {
            it('should return an Family array', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: { 'institution.id': defaultFamily.institution!.id },
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: defaultFamily.id, type: UserType.FAMILY }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(familiesArr)

                return familyRepo.find(customQueryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no family that corresponds to the received parameters', () => {
            it('should return an empty array', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012', type: UserType.FAMILY }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(new Array<FamilyMock>())

                return familyRepo.find(queryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: '', type: UserType.FAMILY }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return familyRepo.find(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findOne(query: IQuery)', () => {
        context('when there is a family that corresponds to the received parameters', () => {
            it('should return the Family that was found', () => {
                queryMock.filters = { _id: defaultFamily.id, type: UserType.FAMILY }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultFamily)

                return familyRepo.findOne(queryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultFamily.id)
                        assert.propertyVal(result, 'username', defaultFamily.username)
                        assert.propertyVal(result, 'password', defaultFamily.password)
                        assert.propertyVal(result, 'type', defaultFamily.type)
                        assert.propertyVal(result, 'scopes', defaultFamily.scopes)
                        assert.propertyVal(result, 'institution', defaultFamily.institution)
                        assert.propertyVal(result, 'children', defaultFamily.children)
                    })
            })
        })

        context('when there is a family that corresponds to the received parameters (with a parameter to the ' +
            'populate (fields))', () => {
            it('should return the Family that was found', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: { 'institution.id': defaultFamily.institution!.id },
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: defaultFamily.id, type: UserType.FAMILY }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultFamily)

                return familyRepo.findOne(customQueryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultFamily.id)
                        assert.propertyVal(result, 'username', defaultFamily.username)
                        assert.propertyVal(result, 'password', defaultFamily.password)
                        assert.propertyVal(result, 'type', defaultFamily.type)
                        assert.propertyVal(result, 'scopes', defaultFamily.scopes)
                        assert.propertyVal(result, 'institution', defaultFamily.institution)
                        assert.propertyVal(result, 'children', defaultFamily.children)
                    })
            })
        })

        context('when there is no family that corresponds to the received parameters', () => {
            it('should return undefined', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012', type: UserType.FAMILY }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return familyRepo.findOne(queryMock)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: '', type: UserType.FAMILY }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return familyRepo.findOne(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('update(item: Family)', () => {
        context('when the family exists in the database', () => {
            it('should return the updated family', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultFamily.id }, defaultFamily, { new: true })
                    .chain('exec')
                    .resolves(defaultFamily)

                return familyRepo.update(defaultFamily)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultFamily.id)
                        assert.propertyVal(result, 'username', defaultFamily.username)
                        assert.propertyVal(result, 'password', defaultFamily.password)
                        assert.propertyVal(result, 'type', defaultFamily.type)
                        assert.propertyVal(result, 'scopes', defaultFamily.scopes)
                        assert.propertyVal(result, 'institution', defaultFamily.institution)
                        assert.propertyVal(result, 'children', defaultFamily.children)
                    })
            })
        })

        context('when the family is not found', () => {
            it('should return undefined', () => {

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultFamily.id }, defaultFamily, { new: true })
                    .chain('exec')
                    .resolves(undefined)

                return familyRepo.update(defaultFamily)
                    .then((result: any) => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {

                defaultFamily.id = ''

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultFamily.id }, defaultFamily, { new: true })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...' })

                return familyRepo.update(defaultFamily)
                    .catch((err) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findById(familyId: string)', () => {
        context('when there is a family that corresponds to the received parameters', () => {
            it('should return the Family that was found', () => {
                defaultFamily.id = '507f1f77bcf86cd799439011'
                queryMock.filters = { _id: defaultFamily.id, type: UserType.FAMILY }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultFamily)

                return familyRepo.findById(defaultFamily.id!)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultFamily.id)
                        assert.propertyVal(result, 'username', defaultFamily.username)
                        assert.propertyVal(result, 'password', defaultFamily.password)
                        assert.propertyVal(result, 'type', defaultFamily.type)
                        assert.propertyVal(result, 'scopes', defaultFamily.scopes)
                        assert.propertyVal(result, 'institution', defaultFamily.institution)
                        assert.propertyVal(result, 'children', defaultFamily.children)
                    })
            })
        })

        context('when there is a family that corresponds to the received parameters (with a parameter to the ' +
            'populate (fields))', () => {
            it('should return the Family that was found', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: { 'institution.id': defaultFamily.institution!.id },
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: defaultFamily.id, type: UserType.FAMILY }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultFamily)

                return familyRepo.findById(defaultFamily.id!)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultFamily.id)
                        assert.propertyVal(result, 'username', defaultFamily.username)
                        assert.propertyVal(result, 'password', defaultFamily.password)
                        assert.propertyVal(result, 'type', defaultFamily.type)
                        assert.propertyVal(result, 'scopes', defaultFamily.scopes)
                        assert.propertyVal(result, 'institution', defaultFamily.institution)
                        assert.propertyVal(result, 'children', defaultFamily.children)
                    })
            })
        })

        context('when there is no family that corresponds to the received parameters', () => {
            it('should return undefined', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012', type: UserType.FAMILY }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return familyRepo.findById(defaultFamily.id!)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultFamily.id = ''
                queryMock.filters = { _id: '', type: UserType.FAMILY }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return familyRepo.findById(defaultFamily.id!)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('checkExists()', () => {
        context('when there is a family with the id used', () => {
            it('should return true if exists in search by id', () => {
                defaultFamily.id = '507f1f77bcf86cd799439011'

                queryMock.filters = { _id: defaultFamily.id, type: UserType.FAMILY }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(true)

                return familyRepo.checkExist(defaultFamily)
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
                            filters: { username: defaultFamily.username, type: UserType.FAMILY }
                        }
                    }
                }

                const familyWithoutId = new Family()
                familyWithoutId.username = defaultFamily.username
                familyWithoutId.type = defaultFamily.type

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(true)

                return familyRepo.checkExist(familyWithoutId)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when family is not found', () => {
            it('should return false', () => {
                const customFamily = new Family()
                customFamily.id = `${new ObjectID()}`
                customFamily.type = UserType.FAMILY

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: customFamily.id, type: UserType.FAMILY }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(false)

                return familyRepo.checkExist(customFamily)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultFamily.id = ''
                queryMock.filters = { _id: defaultFamily.id, type: UserType.FAMILY }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return familyRepo.checkExist(defaultFamily)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    // TODO implement disassociateChildFromFamily test
    describe('disassociateChildFromFamily()', () => {
        it('Not implemented yet.', () => {
            return
        })
    })
})