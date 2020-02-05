import { IChildRepository } from '../../src/application/port/child.repository.interface'
import { Child, FitbitStatus } from '../../src/application/domain/model/child'
import { ValidationException } from '../../src/application/domain/exception/validation.exception'
import { ChildMock } from './child.mock'
import { Strings } from '../../src/utils/strings'

export class ChildRepositoryMock implements IChildRepository {
    public checkExist(child: Child): Promise<boolean | ValidationException> {
        if (child instanceof Array) {
            if (child[0].id === '507f1f77bcf86cd799439012') {
                return Promise.resolve(new ValidationException(
                    Strings.CHILD.CHILDREN_REGISTER_REQUIRED, Strings.CHILD.IDS_WITHOUT_REGISTER))
            }
            return Promise.resolve(child[0].id === '507f1f77bcf86cd799439012')
        }
        return Promise.resolve(child.id === '507f1f77bcf86cd799439011')
    }

    public count(): Promise<number> {
        return Promise.resolve(1)
    }

    public create(child: Child): Promise<Child> {
        return Promise.resolve(child)
    }

    public delete(id: string): Promise<boolean> {
        return Promise.resolve(id === '507f1f77bcf86cd799439012')
    }

    public find(query: any): Promise<Array<Child>> {
        const id: string = (query.filters)._id
        const childrenArr: Array<Child> = new Array<ChildMock>()
        // Only for the test case that returns a filled array
        if (id === '507f1f77bcf86cd799439011') {
            for (let i = 0; i < 3; i++) {
                childrenArr.push(new ChildMock())
            }
        }
        return Promise.resolve(childrenArr)
    }

    public findOne(query: any): Promise<Child> {
        const id: string = query.filters._id
        if (id === '507f1f77bcf86cd799439011') {
            const child: Child = new ChildMock()
            return Promise.resolve(child)
        }
        return Promise.resolve(undefined!)
    }

    public update(child: Child): Promise<Child> {
        if (child.id === '507f1f77bcf86cd799439013') return Promise.resolve(undefined!)
        return Promise.resolve(child)
    }

    public findAll(query: any): Promise<Array<Child>> {
        return this.find(query)
    }

    public updateFitbitStatus(childId: string, fitbitStatus: string): Promise<Child> {
        const child: Child = new Child()
        child.id = childId
        child.fitbit_status = fitbitStatus
        return Promise.resolve(child)
    }

    public updateLastSync(childId: string, lastSync: Date): Promise<Child> {
        const child: Child = new Child()
        child.id = childId
        child.last_sync = lastSync
        child.fitbit_status = FitbitStatus.VALID_TOKEN
        return Promise.resolve(child)
    }
}
