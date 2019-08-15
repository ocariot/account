import { IChildRepository } from '../../src/application/port/child.repository.interface'
import { Child } from '../../src/application/domain/model/child'
import { ValidationException } from '../../src/application/domain/exception/validation.exception'
import { ChildMock } from './child.mock'
import { Strings } from '../../src/utils/strings'

export class ChildRepositoryMock implements IChildRepository {
    public checkExist(child: Child): Promise<boolean> {
        if (child instanceof Array) {
            if (child[0].id === '507f1f77bcf86cd799439012') throw new ValidationException(
                Strings.CHILD.CHILDREN_REGISTER_REQUIRED, Strings.CHILD.IDS_WITHOUT_REGISTER)
            return Promise.resolve(child[0].id === '507f1f77bcf86cd799439012')
        }
        return Promise.resolve(child.id === '507f1f77bcf86cd799439011')
    }

    public count(query: any): Promise<number> {
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
        if (child.id === '507f1f77bcf86cd799439011')
            return Promise.resolve(child)
        return Promise.resolve(undefined!)
    }

}
