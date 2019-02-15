import sinon from 'sinon'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { Institution } from '../../../src/application/domain/model/institution'
import { Child } from '../../../src/application/domain/model/child'
import { User, UserType } from '../../../src/application/domain/model/user'
import { ChildrenGroupRepository } from '../../../src/infrastructure/repository/children.group.repository'
import { ChildrenGroupRepoModel } from '../../../src/infrastructure/database/schema/children.group.schema'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { assert } from 'chai'

require('sinon-mongoose')

describe('Repositories: ChildrenGroup', () => {

    const institution: Institution = new Institution()
    institution.id = '5b13826de00324086854584b'
    institution.type = 'Any Type'
    institution.name = 'Name Example'
    institution.address = '221B Baker Street, St.'
    institution.latitude = 0
    institution.longitude = 0

    const child: Child = new Child()
    child.id = '5b13826de00324086854584c'
    child.username = 'usertest'
    child.password = 'userpass'
    child.age = 13
    child.gender = 'male'
    child.type = UserType.CHILD
    child.institution = institution
    child.scopes = new Array<string>('i-can-everything')

    const user: User = new User()
    user.id = '5b13826de003240868545841'

    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
    defaultChildrenGroup.id = '5b13826de003240868545845'
    defaultChildrenGroup.name = 'ChildrenGroupExample'
    defaultChildrenGroup.children = new Array<Child>(child)
    defaultChildrenGroup.school_class = '4th grade'
    defaultChildrenGroup.user = user

    const modelFake = ChildrenGroupRepoModel
    const repo = new ChildrenGroupRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    afterEach(() => {
        sinon.restore()
    })

    describe('checkExist()', () => {
        it('should return true if exists', () => {
            const customQueryMock: any = {
                toJSON: () => {
                    return {
                        fields: {},
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

            return repo.checkExist(defaultChildrenGroup)
                .then(result => {
                    assert.isBoolean(result)
                    assert.isTrue(result)
                })
        })

        context('when the children group does not have id', () => {
            it('should return false', () => {
                const childrenGroupIncomplete = new ChildrenGroup()

                return repo.checkExist(childrenGroupIncomplete)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.isFalse(result)
                    })
            })
        })

        context('when the children group was not found', () => {
            it('should return false', () => {

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
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
                    .resolves()

                return repo.checkExist(defaultChildrenGroup)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.isFalse(result)
                    })
            })
        })
    })

    // TODO implement deleteAllChildrenGroupsFomUser test
    describe('deleteAllChildrenGroupsFomUser()', () => {
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
