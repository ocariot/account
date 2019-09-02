import { IIntegrationEventRepository } from '../../src/application/port/integration.event.repository.interface'
import { RepositoryException } from '../../src/application/domain/exception/repository.exception'

export class IntegrationEventRepositoryMock implements IIntegrationEventRepository {
    public count(query: any): Promise<number> {
        return Promise.resolve(1)
    }

    public create(item: any): Promise<any> {
        if (item.institution) {
            if (item.institution.id !== '507f1f77bcf86cd799439012') {
                return Promise.resolve(item)
            }
        } else if (item.user) {
            if (item.user.id !== '507f1f77bcf86cd799439012') {
                return Promise.resolve(item)
            }
        } else if (item.application) {
            if (item.application.id !== '507f1f77bcf86cd799439012') {
                return Promise.resolve(item)
            }
        } else if (item.child) {
            if (item.child.id !== '507f1f77bcf86cd799439012') {
                return Promise.resolve(item)
            }
        } else if (item.educator) {
            if (item.educator.id !== '507f1f77bcf86cd799439012') {
                return Promise.resolve(item)
            }
        } else if (item.healthprofessional) {
            if (item.healthprofessional.id !== '507f1f77bcf86cd799439012') {
                return Promise.resolve(item)
            }
        } else if (item.family) {
            if (item.family.id !== '507f1f77bcf86cd799439012') {
                return Promise.resolve(item)
            }
        }
        return Promise.reject(new RepositoryException('Mock RepositoryException', 'Description of mock RepositoryException'))
    }

    public delete(id: string | number): Promise<boolean> {
        return Promise.resolve(true)
    }

    public find(query: any): Promise<Array<any>> {
        return Promise.resolve(new Array<any>())
    }

    public findOne(query: any): Promise<any> {
        return Promise.resolve()
    }

    public update(item: any): Promise<any> {
        return Promise.resolve(item)
    }

}
