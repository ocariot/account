import { IApplicationRepository } from '../../src/application/port/application.repository.interface'
import { Application } from '../../src/application/domain/model/application'
import { ApplicationMock } from './application.mock'

export class ApplicationRepositoryMock implements IApplicationRepository {
    public checkExist(application: Application): Promise<boolean> {
        return Promise.resolve(application.id === '507f1f77bcf86cd799439011')
    }

    public count(): Promise<number> {
        return Promise.resolve(1)
    }

    public create(application: Application): Promise<Application> {
        return Promise.resolve(application)
    }

    public delete(id: string): Promise<boolean> {
        return Promise.resolve(id === '507f1f77bcf86cd799439011')
    }

    public find(query: any): Promise<Array<Application>> {
        const id: string = (query.filters)._id
        const applicationArr: Array<Application> = new Array<ApplicationMock>()
        // Only for the test case that returns a filled array
        if (id === '507f1f77bcf86cd799439011') {
            for (let i = 0; i < 3; i++) {
                applicationArr.push(new ApplicationMock())
            }
        }
        return Promise.resolve(applicationArr)
    }

    public findByUsername(username: string, users: Array<any>): Array<Application> {
        return new Array<Application>()
    }

    public findOne(query: any): Promise<Application> {
        const id: string = query.filters._id
        if (id === '507f1f77bcf86cd799439011') {
            const application: Application = new ApplicationMock()
            return Promise.resolve(application)
        }
        return Promise.resolve(undefined!)
    }

    public update(application: Application): Promise<Application> {
        if (application.id === '507f1f77bcf86cd799439013') return Promise.resolve(undefined!)
        return Promise.resolve(application)
    }
}
