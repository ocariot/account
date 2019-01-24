import { injectable } from 'inversify'
import { IChildService } from '../port/child.service.interface'
import { Child } from '../domain/model/child'
import { IQuery } from '../port/query.interface'

/**
 * Implementing activity Service.
 *
 * @implements {IActivityService}
 */
@injectable()
export class ChildService implements IChildService {
    public add(item: Child): Promise<Child> {
        throw Error('')
    }

    public getAll(query: IQuery): Promise<Array<Child>> {
        throw Error('')
    }

    public getById(id: string | number, query: IQuery): Promise<Child> {
        throw Error('')
    }

    public remove(id: string | number): Promise<boolean> {
        throw Error('')
    }

    public update(item: Child): Promise<Child> {
        throw Error('')
    }
}
