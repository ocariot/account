import sinon from 'sinon'
import { assert } from 'chai'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { ILogger } from '../../../src/utils/custom.logger'
import { IChildRepository } from '../../../src/application/port/child.repository.interface'
import { ChildRepositoryMock } from '../../mocks/child.repository.mock'
import { IChildrenGroupRepository } from '../../../src/application/port/children.group.repository.interface'
import { ChildrenGroupRepositoryMock } from '../../mocks/children.group.repository.mock'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { ChildrenGroupMock } from '../../mocks/children.group.mock'
import { IChildrenGroupService } from '../../../src/application/port/children.group.service.interface'
import { ChildrenGroupService } from '../../../src/application/service/children.group.service'
import { UserMock } from '../../mocks/user.mock'
import { ChildrenGroupRepoModel } from '../../../src/infrastructure/database/schema/children.group.schema'
import { Strings } from '../../../src/utils/strings'
import { Child } from '../../../src/application/domain/model/child'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'

require('sinon-mongoose')

describe('Services: ChildrenGroup', () => {
    const childrenGroup: ChildrenGroup = new ChildrenGroupMock()
    childrenGroup.user = new UserMock()

    const incorrectChildrenGroup: ChildrenGroup = new ChildrenGroup()

    // Mock children array
    const childrenGroupArr: Array<ChildrenGroup> = new Array<ChildrenGroupMock>()
    for (let i = 0; i < 3; i++) {
        childrenGroupArr.push(new ChildrenGroupMock())
    }

    const modelFake: any = ChildrenGroupRepoModel
    const childRepo: IChildRepository = new ChildRepositoryMock()
    const childrenGroupRepo: IChildrenGroupRepository = new ChildrenGroupRepositoryMock()

    const customLogger: ILogger = new CustomLoggerMock()

    const childrenGroupService: IChildrenGroupService = new ChildrenGroupService(childrenGroupRepo, childRepo, customLogger)

    afterEach(() => {
        sinon.restore()
    })

    /**
     * Method "add(childrenGroup: ChildrenGroup)"
     */
    describe('add(childrenGroup: ChildrenGroup)', () => {
        context('when the ChildrenGroup is correct and it still does not exist in the repository', () => {
            it('should return the ChildrenGroup that was added', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(childrenGroup)
                    .chain('exec')
                    .resolves(childrenGroup)

                return childrenGroupService.add(childrenGroup)
                    .then(result => {
                        assert.propertyVal(result, 'id', childrenGroup.id)
                        assert.propertyVal(result, 'name', childrenGroup.name)
                        assert.equal(result.children![0], childrenGroup.children![0])
                        assert.equal(result.children![1], childrenGroup.children![1])
                        assert.propertyVal(result, 'school_class', childrenGroup.school_class)
                    })
            })
        })

        context('when the ChildrenGroup is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                childrenGroup.id = '507f1f77bcf86cd799439011'        // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(childrenGroup)
                    .chain('exec')
                    .rejects({ message: Strings.CHILDREN_GROUP.ALREADY_REGISTERED})

                return childrenGroupService.add(childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILDREN_GROUP.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the ChildrenGroup is correct and it still does not exist in the repository but the children are not ' +
            'registered', () => {
            it('should throw a ValidationException', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'
                childrenGroup.children![0].id = '507f1f77bcf86cd799439012'      // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(childrenGroup)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.CHILDREN_REGISTER_REQUIRED,
                               description: Strings.CHILD.IDS_WITHOUT_REGISTER })

                return childrenGroupService.add(childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.CHILD.IDS_WITHOUT_REGISTER)
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (the user id is invalid)', () => {
            it('should throw a ValidationException', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'
                childrenGroup.user!.id = '507f1f77bcf86cd7994390111'      // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(childrenGroup)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return childrenGroupService.add(childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (missing ChildrenGroup fields)', () => {
            it('should throw a ValidationException', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectChildrenGroup)
                    .chain('exec')
                    .rejects({ message: 'Required fields were not provided...',
                               description: 'Children Group validation: name, user, Collection with children IDs is required!' })

                return childrenGroupService.add(incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Children Group validation: name, user, Collection with ' +
                            'children IDs is required!')
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (missing ChildrenGroup (missing some child id) fields)', () => {
            it('should throw a ValidationException', () => {
                incorrectChildrenGroup.children = [new Child()]         // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectChildrenGroup)
                    .chain('exec')
                    .rejects({ message: 'Required fields were not provided...',
                               description: 'Children Group validation: name, user, Collection with children IDs (ID can not ' +
                                   'be empty) is required!' })

                return childrenGroupService.add(incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Children Group validation: name, user, Collection with ' +
                            'children IDs (ID can not be empty) is required!')
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (some child id is invalid)', () => {
            it('should throw a ValidationException', () => {
                const childTest: Child = new Child()
                childTest.id = '507f1f77bcf86cd7994390111'          // Make mock throw an exception
                incorrectChildrenGroup.children = [childTest]
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectChildrenGroup)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return childrenGroupService.add(incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "getAll(query: IQuery)"
     */
    describe('getAll(query: IQuery)', () => {
        context('when there is at least one children group object in the database that matches the query filters', () => {
            it('should return an ChildrenGroup array', () => {
                childrenGroup.id = '507f1f77bcf86cd799439011'     // Make mock return a filled array
                const query: IQuery = new Query()
                query.filters = { _id: childrenGroup.id }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(childrenGroupArr)

                return childrenGroupService.getAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no child object in the database that matches the query filters', () => {
            it('should return an empty array', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'         // Make mock return an empty array
                const query: IQuery = new Query()
                query.filters = { _id: childrenGroup.id }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(new Array<ChildrenGroupMock>())

                return childrenGroupService.getAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })
    })

    /**
     * Method "getById(id: string, query: IQuery)"
     */
    describe('getById(id: string, query: IQuery)', () => {
        context('when there is a children group with the received parameters', () => {
            it('should return the ChildrenGroup that was found', () => {
                childrenGroup.id = '507f1f77bcf86cd799439011'         // Make mock return a ChildrenGroup
                const query: IQuery = new Query()
                query.filters = { _id: childrenGroup.id }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(childrenGroup)

                return childrenGroupService.getById(childrenGroup.id, query)
                    .then(result => {
                        assert.propertyVal(result, 'id', childrenGroup.id)
                        assert.propertyVal(result, 'name', childrenGroup.name)
                        assert.property(result, 'children')
                        assert.propertyVal(result, 'school_class', childrenGroup.school_class)
                    })
            })
        })

        context('when there is no children group with the received parameters', () => {
            it('should return undefined', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                const query: IQuery = new Query()
                query.filters = { _id: childrenGroup.id }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(undefined)

                return childrenGroupService.getById(childrenGroup.id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })
    })

    /**
     * Method "update(childrenGroup: ChildrenGroup)"
     */
    describe('update(childrenGroup: ChildrenGroup)', () => {
        context('when the ChildrenGroup exists in the database', () => {
            it('should return the ChildrenGroup that was updated', () => {
                childrenGroup.children![0].id = '507f1f77bcf86cd799439011'
                childrenGroup.id = '507f1f77bcf86cd799439011'         // Make mock return an updated child
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(childrenGroup)
                    .chain('exec')
                    .resolves(childrenGroup)

                return childrenGroupService.update(childrenGroup)
                    .then(result => {
                        assert.propertyVal(result, 'id', childrenGroup.id)
                        assert.propertyVal(result, 'name', childrenGroup.name)
                        assert.equal(result.children![0], childrenGroup.children![0])
                        assert.equal(result.children![1], childrenGroup.children![1])
                        assert.propertyVal(result, 'school_class', childrenGroup.school_class)
                    })
            })
        })

        context('when the ChildrenGroup does not exist in the database', () => {
            it('should return undefined', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(childrenGroup)
                    .chain('exec')
                    .resolves(undefined)

                return childrenGroupService.update(childrenGroup)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the ChildrenGroup exists in the database but the children are not registered', () => {
            it('should throw a ValidationException', () => {
                childrenGroup.id = '507f1f77bcf86cd799439011'
                childrenGroup.children![0].id = '507f1f77bcf86cd799439012'      // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(childrenGroup)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.CHILDREN_REGISTER_REQUIRED,
                               description: Strings.CHILD.IDS_WITHOUT_REGISTER })

                return childrenGroupService.update(childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.CHILD.IDS_WITHOUT_REGISTER)
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (missing ChildrenGroup (missing some child id) fields)', () => {
            it('should throw a ValidationException', () => {
                incorrectChildrenGroup.children = [new Child()]         // Make mock throw an exception
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectChildrenGroup)
                    .chain('exec')
                    .rejects({ message: 'Required fields were not provided...',
                               description: 'Children Group validation: Collection with children IDs (ID can not be empty) ' +
                                   'is required!' })

                return childrenGroupService.update(incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Children Group validation: Collection with children IDs ' +
                            '(ID can not be empty) is required!')
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (some child id is invalid)', () => {
            it('should throw a ValidationException', () => {
                const childTest: Child = new Child()
                childTest.id = '507f1f77bcf86cd7994390111'          // Make mock throw an exception
                incorrectChildrenGroup.children = [childTest]
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectChildrenGroup)
                    .chain('exec')
                    .rejects({ message: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return childrenGroupService.update(incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    /**
     * Method "remove(id: string)"
     */
    describe('remove(id: string)', () => {
        context('when there is ChildrenGroup with the received parameter', () => {
            it('should return true', () => {
                childrenGroup.id = '507f1f77bcf86cd799439011'         // Make mock return true
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(childrenGroup.id)
                    .chain('exec')
                    .resolves(true)

                return childrenGroupService.remove(childrenGroup.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no ChildrenGroup with the received parameter', () => {
            it('should return false', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'         // Make mock return false
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(childrenGroup.id)
                    .chain('exec')
                    .resolves(false)

                return childrenGroupService.remove(childrenGroup.id)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })
    })
})
