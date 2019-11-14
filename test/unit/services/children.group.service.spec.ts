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
import { Strings } from '../../../src/utils/strings'
import { Child } from '../../../src/application/domain/model/child'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'

describe('Services: ChildrenGroup', () => {
    const childrenGroup: ChildrenGroup = new ChildrenGroupMock()
    childrenGroup.user = new UserMock()

    const incorrectChildrenGroup: ChildrenGroup = new ChildrenGroup()

    // Mock children array
    const childrenGroupArr: Array<ChildrenGroup> = new Array<ChildrenGroupMock>()
    for (let i = 0; i < 3; i++) {
        childrenGroupArr.push(new ChildrenGroupMock())
    }

    const childRepo: IChildRepository = new ChildRepositoryMock()
    const childrenGroupRepo: IChildrenGroupRepository = new ChildrenGroupRepositoryMock()

    const customLogger: ILogger = new CustomLoggerMock()

    const childrenGroupService: IChildrenGroupService = new ChildrenGroupService(childrenGroupRepo, childRepo, customLogger)

    /**
     * Method "add(childrenGroup: ChildrenGroup)"
     */
    describe('add(childrenGroup: ChildrenGroup)', () => {
        context('when the ChildrenGroup is correct and it still does not exist in the repository', () => {
            it('should return the ChildrenGroup that was added', () => {
                if (childrenGroup.children) childrenGroup.children.forEach(childItem => {
                    childItem.id = '507f1f77bcf86cd799439011'
                })

                return childrenGroupService.add(childrenGroup)
                    .then(result => {
                        assert.propertyVal(result, 'id', childrenGroup.id)
                        assert.propertyVal(result, 'name', childrenGroup.name)
                        assert.propertyVal(result, 'children', childrenGroup.children)
                        assert.propertyVal(result, 'school_class', childrenGroup.school_class)
                        assert.propertyVal(result, 'user', childrenGroup.user)
                    })
            })
        })

        context('when the ChildrenGroup is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                childrenGroup.id = '507f1f77bcf86cd799439011'        // Make mock throw an exception

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

                return childrenGroupService.add(childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.CHILD.IDS_WITHOUT_REGISTER
                            .concat(Strings.CHILD.CHILDREN_REGISTER_REQUIRED))
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (the user id is invalid)', () => {
            it('should throw a ValidationException', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'
                childrenGroup.user!.id = '507f1f77bcf86cd7994390111'      // Make mock throw an exception

                return childrenGroupService.add(childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (missing ChildrenGroup fields)', () => {
            it('should throw a ValidationException', () => {

                return childrenGroupService.add(incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        assert.propertyVal(err, 'description', 'name, user, Collection with ' +
                            'children IDs'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (missing ChildrenGroup (missing some child id) fields)', () => {
            it('should throw a ValidationException', () => {
                incorrectChildrenGroup.children = [new Child()]         // Make mock throw an exception

                return childrenGroupService.add(incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.INVALID_MULTIPLE_UUID)
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (some child id is invalid)', () => {
            it('should throw a ValidationException', () => {
                const childTest: Child = new Child()
                childTest.id = '507f1f77bcf86cd7994390111'          // Make mock throw an exception
                incorrectChildrenGroup.children = [childTest]

                return childrenGroupService.add(incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        assert.propertyVal(err, 'description',
                            Strings.ERROR_MESSAGE.MULTIPLE_UUID_NOT_VALID_FORMAT.concat('507f1f77bcf86cd7994390111'))
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

                return childrenGroupService.getById(childrenGroup.id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no children group with the received parameters', () => {
            it('should return undefined', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'         // Make mock return undefined
                const query: IQuery = new Query()
                query.filters = { _id: childrenGroup.id }

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

                return childrenGroupService.update(childrenGroup)
                    .then(result => {
                        assert.propertyVal(result, 'id', childrenGroup.id)
                        assert.propertyVal(result, 'name', childrenGroup.name)
                        assert.propertyVal(result, 'children', childrenGroup.children)
                        assert.propertyVal(result, 'school_class', childrenGroup.school_class)
                        assert.propertyVal(result, 'user', childrenGroup.user)
                    })
            })
        })

        context('when the ChildrenGroup does not exist in the database', () => {
            it('should return undefined', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'         // Make mock return undefined

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

                return childrenGroupService.update(childrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        assert.propertyVal(err, 'description', Strings.CHILD.IDS_WITHOUT_REGISTER
                            .concat(Strings.CHILD.CHILDREN_REGISTER_REQUIRED))
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (missing ChildrenGroup (missing some child id) fields)', () => {
            it('should throw a ValidationException', () => {
                incorrectChildrenGroup.children = [new Child()]         // Make mock throw an exception

                return childrenGroupService.update(incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.INVALID_MULTIPLE_UUID)
                    })
            })
        })

        context('when the ChildrenGroup is incorrect (some child id is invalid)', () => {
            it('should throw a ValidationException', () => {
                const childTest: Child = new Child()
                childTest.id = '507f1f77bcf86cd7994390111'          // Make mock throw an exception
                incorrectChildrenGroup.children = [childTest]

                return childrenGroupService.update(incorrectChildrenGroup)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.MULTIPLE_UUID_NOT_VALID_FORMAT
                            .concat('507f1f77bcf86cd7994390111'))
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

                return childrenGroupService.remove(childrenGroup.id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no ChildrenGroup with the received parameter', () => {
            it('should return false', () => {
                childrenGroup.id = '507f1f77bcf86cd799439012'         // Make mock return false

                return childrenGroupService.remove(childrenGroup.id)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })
    })
})
