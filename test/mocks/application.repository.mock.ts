import { IApplicationRepository } from '../../src/application/port/application.repository.interface'
import { Application } from '../../src/application/domain/model/application'
import { ApplicationMock } from './application.mock'

export class ApplicationRepositoryMock implements IApplicationRepository {
    public checkExist(application: Application): Promise<boolean> {
        if (application.id === '507f1f77bcf86cd799439011')
            return Promise.resolve(true)
        return Promise.resolve(false)
    }

    public count(query: any): Promise<number> {
        return Promise.resolve(1)
    }

    public create(item: Application): Promise<Application> {
        return Promise.resolve(item)
    }

    public delete(id: string): Promise<boolean> {
        if (id === '507f1f77bcf86cd799439011')
            return Promise.resolve(true)
        return Promise.resolve(false)
    }

    public find(query: any): Promise<Array<Application>> {
        const id: string = (query.filters).id
        const applicationArr: Array<Application> = new Array<ApplicationMock>()
        // Only for the test case that returns a filled array
        if (!(id === '507f1f77bcf86cd799439011')) {
            for (let i = 0; i < 3; i++) {
                applicationArr.push(new ApplicationMock())
            }
        }
        return Promise.resolve(applicationArr)
    }

    public findOne(query: any): Promise<Application> {
        const application: Application = new ApplicationMock()
        return Promise.resolve(application)
    }

    public update(item: Application): Promise<Application> {
        return Promise.resolve(item)
    }
}
