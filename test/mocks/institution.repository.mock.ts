import { IInstitutionRepository } from '../../src/application/port/institution.repository.interface'
import { Institution } from '../../src/application/domain/model/institution'
import { InstitutionMock } from './institution.mock'

export class InstitutionRepositoryMock implements IInstitutionRepository {
    public checkExist(institution: Institution): Promise<boolean> {
        if (institution.id === '507f1f77bcf86cd799439011')
            return Promise.resolve(true)
        return Promise.resolve(false)
    }

    public count(query: any): Promise<number> {
        return Promise.resolve(1)
    }

    public create(item: Institution): Promise<Institution> {
        return Promise.resolve(item)
    }

    public delete(id: string): Promise<boolean> {
        if (id === '507f1f77bcf86cd799439011')
            return Promise.resolve(true)
        return Promise.resolve(false)
    }

    public find(query: any): Promise<Array<Institution>> {
        const id: string = (query.filters)._id
        const institutionArr: Array<Institution> = new Array<InstitutionMock>()
        // Only for the test case that returns a filled array
        if (id === '507f1f77bcf86cd799439011') {
            for (let i = 0; i < 3; i++) {
                institutionArr.push(new InstitutionMock())
            }
        }
        return Promise.resolve(institutionArr)
    }

    public findOne(query: any): Promise<Institution> {
        const id: string = query.filters._id
        if (id === '507f1f77bcf86cd799439011') {
            const institution: Institution = new InstitutionMock()
            return Promise.resolve(institution)
        }
        return Promise.resolve(undefined!)
    }

    public update(item: Institution): Promise<Institution> {
        return Promise.resolve(item)
    }

}
