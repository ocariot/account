import sinon from 'sinon'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { ChildrenGroupRepository } from '../../../src/infrastructure/repository/children.group.repository'
import { ChildrenGroupRepoModel } from '../../../src/infrastructure/database/schema/children.group.schema'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { assert } from 'chai'
import { ChildrenGroupMock } from '../../mocks/children.group.mock'
import { UserMock } from '../../mocks/user.mock'

require('sinon-mongoose')

describe('Repositories: ChildrenGroup', () => {
    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()
    defaultChildrenGroup.id = '507f1f77bcf86cd799439011'
    defaultChildrenGroup.user = new UserMock()

    // Mock children array
    const childrenGroupArr: Array<ChildrenGroup> = new Array<ChildrenGroupMock>()
    for (let i = 0; i < 3; i++) {
        childrenGroupArr.push(new ChildrenGroupMock())
    }

    const modelFake = ChildrenGroupRepoModel
    const childrenGroupRepo = new ChildrenGroupRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    // Query mock
    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: { _id: defaultChildrenGroup.id }
            }
        }
    }

    afterEach(() => {
        sinon.restore()
    })

    describe('create(item: ChildrenGroup)', () => {
        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(defaultChildrenGroup)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return childrenGroupRepo.create(defaultChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('find(query: IQuery)', () => {
        context('when there is at least one childrenGroup that corresponds to the received parameters', () => {
            it('should return an ChildrenGroup array', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(childrenGroupArr)

                return childrenGroupRepo.find(queryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is at least one childrenGroup that corresponds to the received parameters (with a parameter to the ' +
            'populate (fields))', () => {
            it('should return an ChildrenGroup array', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: { 'institution.id': defaultChildrenGroup.user!.institution!.id },
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: defaultChildrenGroup.id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(childrenGroupArr)

                return childrenGroupRepo.find(customQueryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no childrenGroup that corresponds to the received parameters', () => {
            it('should return an empty array', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012' }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(new Array<ChildrenGroupMock>())

                return childrenGroupRepo.find(queryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: '' }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return childrenGroupRepo.find(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findOne(query: IQuery)', () => {
        context('when there is a childrenGroup that corresponds to the received parameters', () => {
            it('should return the ChildrenGroup that was found', () => {
                queryMock.filters = { _id: defaultChildrenGroup.id }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultChildrenGroup)

                return childrenGroupRepo.findOne(queryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultChildrenGroup.id)
                        assert.propertyVal(result, 'name', defaultChildrenGroup.name)
                        assert.propertyVal(result, 'children', defaultChildrenGroup.children)
                        assert.propertyVal(result, 'school_class', defaultChildrenGroup.school_class)
                        assert.propertyVal(result, 'user', defaultChildrenGroup.user)
                    })
            })
        })

        context('when there is a childrenGroup that corresponds to the received parameters (with a parameter to the ' +
            'populate (fields))', () => {
            it('should return the ChildrenGroup that was found', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: { 'institution.id': defaultChildrenGroup.user!.institution!.id },
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: { _id: defaultChildrenGroup.id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultChildrenGroup)

                return childrenGroupRepo.findOne(customQueryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultChildrenGroup.id)
                        assert.propertyVal(result, 'name', defaultChildrenGroup.name)
                        assert.propertyVal(result, 'children', defaultChildrenGroup.children)
                        assert.propertyVal(result, 'school_class', defaultChildrenGroup.school_class)
                        assert.propertyVal(result, 'user', defaultChildrenGroup.user)
                    })
            })
        })

        context('when there is a childrenGroup that corresponds to the received parameters (with a parameter to the ' +
            'populate (filters))', () => {
            it('should return the ChildrenGroup that was found', () => {
                queryMock.filters = { '_id': defaultChildrenGroup.id,
                                       'institution.id': defaultChildrenGroup.user!.institution!.id }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultChildrenGroup)

                return childrenGroupRepo.findOne(queryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultChildrenGroup.id)
                        assert.propertyVal(result, 'name', defaultChildrenGroup.name)
                        assert.propertyVal(result, 'children', defaultChildrenGroup.children)
                        assert.propertyVal(result, 'school_class', defaultChildrenGroup.school_class)
                        assert.propertyVal(result, 'user', defaultChildrenGroup.user)
                    })
            })
        })

        context('when there is no childrenGroup that corresponds to the received parameters', () => {
            it('should return undefined', () => {
                queryMock.filters = { _id: '507f1f77bcf86cd799439012' }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return childrenGroupRepo.findOne(queryMock)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                queryMock.filters = { _id: '' }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return childrenGroupRepo.findOne(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('update(item: ChildrenGroup)', () => {
        context('when the childrenGroup exists in the database', () => {
            it('should return the updated childrenGroup', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultChildrenGroup.id }, defaultChildrenGroup, { new: true })
                    .chain('exec')
                    .resolves(defaultChildrenGroup)

                return childrenGroupRepo.update(defaultChildrenGroup)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultChildrenGroup.id)
                        assert.propertyVal(result, 'name', defaultChildrenGroup.name)
                        assert.propertyVal(result, 'children', defaultChildrenGroup.children)
                        assert.propertyVal(result, 'school_class', defaultChildrenGroup.school_class)
                        assert.propertyVal(result, 'user', defaultChildrenGroup.user)
                    })
            })
        })

        context('when the childrenGroup is not found', () => {
            it('should return undefined', () => {

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultChildrenGroup.id }, defaultChildrenGroup, { new: true })
                    .chain('exec')
                    .resolves(undefined)

                return childrenGroupRepo.update(defaultChildrenGroup)
                    .then((result: any) => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {

                defaultChildrenGroup.id = ''

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultChildrenGroup.id }, defaultChildrenGroup, { new: true })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return childrenGroupRepo.update(defaultChildrenGroup)
                    .catch((err) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('checkExist()', () => {
        context('when there is a childrenGroup with the id used', () => {
            it('should return true if exists', () => {
                defaultChildrenGroup.id = '507f1f77bcf86cd799439011'
                queryMock.filters = { _id: defaultChildrenGroup.id }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(true)

                return childrenGroupRepo.checkExist(defaultChildrenGroup)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the children group does not have id', () => {
            it('should return true if exists in search by name and user_id', () => {
                const childrenGroupIncomplete = new ChildrenGroupMock()
                childrenGroupIncomplete.id = undefined
                childrenGroupIncomplete.user!.id = '507f1f77bcf86cd799439011'

                queryMock.filters = { name: childrenGroupIncomplete.name, user_id: '507f1f77bcf86cd799439011' }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(true)

                return childrenGroupRepo.checkExist(defaultChildrenGroup)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the children group was not found', () => {
            it('should return false', () => {
                queryMock.filters = { _id: defaultChildrenGroup.id }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(false)

                return childrenGroupRepo.checkExist(defaultChildrenGroup)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultChildrenGroup.id = ''
                queryMock.filters = { _id: defaultChildrenGroup.id }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return childrenGroupRepo.checkExist(defaultChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    // TODO implement deleteAllChildrenGroupsFromUser test
    describe('deleteAllChildrenGroupsFromUser()', () => {
        it('Not implemented yet.', () => {
            return
        })
    })

    // TODO implement disassociateChildFromChildrenGroups test
    describe('disassociateChildFromChildrenGroups()', () => {
        it('Not implemented yet.', () => {
            return
        })
    })
})
