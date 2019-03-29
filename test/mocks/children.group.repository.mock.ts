import { IChildrenGroupRepository } from '../../src/application/port/children.group.repository.interface'
import { ChildrenGroup } from '../../src/application/domain/model/children.group'
import { ChildrenGroupMock } from './children.group.mock'
import { ValidationException } from '../../src/application/domain/exception/validation.exception'

export class ChildrenGroupRepositoryMock implements IChildrenGroupRepository {
    public checkExist(childrenGroup: ChildrenGroup): Promise<boolean> {
        return Promise.resolve(childrenGroup.id === '507f1f77bcf86cd799439011')
    }

    public count(query: any): Promise<number> {
        return Promise.resolve(1)
    }

    public create(childrenGroup: ChildrenGroup): Promise<ChildrenGroup> {
        return Promise.resolve(childrenGroup)
    }

    public delete(id: string): Promise<boolean> {
        return Promise.resolve(id === '507f1f77bcf86cd799439011')
    }

    public deleteAllChildrenGroupsFromUser(userId: string): Promise<boolean> {
        if (userId === '507f1f77bcf86cd799439011') return Promise.resolve(true)
        else throw new ValidationException('A error occur when try disassociate the child from user!')
    }

    public disassociateChildFromChildrenGroups(childId: string): Promise<boolean> {
        if (childId === '507f1f77bcf86cd799439011') return Promise.resolve(true)
        else throw new ValidationException('A error occur when try disassociate the child from children group!')
    }

    public find(query: any): Promise<Array<ChildrenGroup>> {
        const id: string = (query.filters)._id
        const childrenGroupArr: Array<ChildrenGroup> = new Array<ChildrenGroupMock>()
        // Only for the test case that returns a filled array
        if (id === '507f1f77bcf86cd799439011') {
            for (let i = 0; i < 3; i++) {
                childrenGroupArr.push(new ChildrenGroupMock())
            }
        }
        return Promise.resolve(childrenGroupArr)
    }

    public findOne(query: any): Promise<ChildrenGroup> {
        const id: string = query.filters._id
        if (id === '507f1f77bcf86cd799439011') {
            const childrenGroup: ChildrenGroup = new ChildrenGroupMock()
            childrenGroup.id = '507f1f77bcf86cd799439011'
            return Promise.resolve(childrenGroup)
        }
        return Promise.resolve(undefined!)
    }

    public update(childrenGroup: ChildrenGroup): Promise<ChildrenGroup> {
        if (childrenGroup.id === '507f1f77bcf86cd799439011') {
            return Promise.resolve(childrenGroup)
        }
        return Promise.resolve(undefined!)
    }

}
