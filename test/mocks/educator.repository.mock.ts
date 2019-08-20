import { IEducatorRepository } from '../../src/application/port/educator.repository.interface'
import { Educator } from '../../src/application/domain/model/educator'
import { EducatorMock } from './educator.mock'

export class EducatorRepositoryMock implements IEducatorRepository {
    public checkExist(educator: Educator): Promise<boolean> {
        return Promise.resolve(educator.id === '507f1f77bcf86cd799439011')
    }

    public count(): Promise<number> {
        return Promise.resolve(1)
    }

    public countChildrenGroups(educatorId: string): Promise<number> {
        return Promise.resolve(1)
    }

    public create(educator: Educator): Promise<Educator> {
        return Promise.resolve(educator)
    }

    public delete(id: string): Promise<boolean> {
        return Promise.resolve(id === '507f1f77bcf86cd799439013')
    }

    public find(query: any): Promise<Array<Educator>> {
        const id: string = (query.filters)._id
        const educatorsArr: Array<Educator> = new Array<EducatorMock>()
        // Only for the test case that returns a filled array
        if (id === '507f1f77bcf86cd799439011') {
            for (let i = 0; i < 3; i++) {
                educatorsArr.push(new EducatorMock())
            }
        }
        return Promise.resolve(educatorsArr)
    }

    public findById(educatorId: string): Promise<Educator> {
        if (educatorId === '507f1f77bcf86cd799439011') {
            const educator: Educator = new EducatorMock()
            educator.id = '507f1f77bcf86cd799439011'
            educator.children_groups![0].id = '507f1f77bcf86cd799439011'
            return Promise.resolve(educator)
        }
        return Promise.resolve(undefined!)
    }

    public findOne(query: any): Promise<Educator> {
        const id: string = query.filters._id
        if (id === '507f1f77bcf86cd799439011') {
            const educator: Educator = new EducatorMock()
            return Promise.resolve(educator)
        }
        return Promise.resolve(undefined!)
    }

    public update(educator: Educator): Promise<Educator> {
        if (educator.id === '507f1f77bcf86cd799439011')
            return Promise.resolve(educator)
        return Promise.resolve(undefined!)
    }

}
