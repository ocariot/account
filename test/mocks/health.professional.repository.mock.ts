import { IHealthProfessionalRepository } from '../../src/application/port/health.professional.repository.interface'
import { HealthProfessional } from '../../src/application/domain/model/health.professional'
import { HealthProfessionalMock } from './health.professional.mock'

export class HealthProfessionalRepositoryMock implements IHealthProfessionalRepository {
    public checkExist(healthProfessional: HealthProfessional): Promise<boolean> {
        return Promise.resolve(healthProfessional.id === '507f1f77bcf86cd799439011')
    }

    public count(): Promise<number> {
        return Promise.resolve(1)
    }

    public countChildrenGroups(healthProfessionalId: string): Promise<number> {
        return Promise.resolve(1)
    }

    public create(healthProfessional: HealthProfessional): Promise<HealthProfessional> {
        return Promise.resolve(healthProfessional)
    }

    public delete(id: string): Promise<boolean> {
        return Promise.resolve(id === '507f1f77bcf86cd799439015')
    }

    public find(query: any): Promise<Array<HealthProfessional>> {
        const id: string = (query.filters)._id
        const healthProfessionalsArr: Array<HealthProfessional> = new Array<HealthProfessionalMock>()
        // Only for the test case that returns a filled array
        if (id === '507f1f77bcf86cd799439011') {
            for (let i = 0; i < 3; i++) {
                healthProfessionalsArr.push(new HealthProfessionalMock())
            }
        }
        return Promise.resolve(healthProfessionalsArr)
    }

    public findById(healthProfessionalId: string): Promise<HealthProfessional> {
        if (healthProfessionalId === '507f1f77bcf86cd799439011') {
            const healthProfessional: HealthProfessional = new HealthProfessionalMock()
            healthProfessional.id = '507f1f77bcf86cd799439011'
            healthProfessional.children_groups![0].id = '507f1f77bcf86cd799439011'
            return Promise.resolve(healthProfessional)
        }
        return Promise.resolve(undefined!)
    }

    public findOne(query: any): Promise<HealthProfessional> {
        const id: string = query.filters._id
        if (id === '507f1f77bcf86cd799439011') {
            const healthProfessional: HealthProfessional = new HealthProfessionalMock()
            return Promise.resolve(healthProfessional)
        }
        return Promise.resolve(undefined!)
    }

    public update(healthProfessional: HealthProfessional): Promise<HealthProfessional> {
        if (healthProfessional.id === '507f1f77bcf86cd799439013') return Promise.resolve(undefined!)
        return Promise.resolve(healthProfessional)
    }

}
