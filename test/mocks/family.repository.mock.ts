import { IFamilyRepository } from '../../src/application/port/family.repository.interface'
import { Family } from '../../src/application/domain/model/family'
import { FamilyMock } from './family.mock'
import { ValidationException } from '../../src/application/domain/exception/validation.exception'
import { RepositoryException } from '../../src/application/domain/exception/repository.exception'
import { Strings } from '../../src/utils/strings'

export class FamilyRepositoryMock implements IFamilyRepository {
    public checkExist(family: Family): Promise<boolean> {
        return Promise.resolve(family.id === '507f1f77bcf86cd799439011')
    }

    public count(): Promise<number> {
        return Promise.resolve(1)
    }

    public countChildrenFromFamily(familyId: string): Promise<number> {
        return Promise.resolve(1)
    }

    public create(family: Family): Promise<Family> {
        return Promise.resolve(family)
    }

    public delete(id: string): Promise<boolean> {
        return Promise.resolve(id === '507f1f77bcf86cd799439014')
    }

    public disassociateChildFromFamily(childId: string): Promise<boolean> {
        if (childId === '507f1f77bcf86cd799439011') return Promise.resolve(true)
        else throw new ValidationException('A error occur when try disassociate the child from family!')
    }

    public find(query: any): Promise<Array<Family>> {
        const id: string = (query.filters)._id
        const familyArr: Array<Family> = new Array<FamilyMock>()
        // Only for the test case that returns a filled array
        if (id === '507f1f77bcf86cd799439011') {
            for (let i = 0; i < 3; i++) {
                familyArr.push(new FamilyMock())
            }
        }
        return Promise.resolve(familyArr)
    }

    public findById(familyId: string): Promise<Family> {
        if (familyId === '507f1f77bcf86cd799439011') {
            const family: Family = new FamilyMock()
            family.id = '507f1f77bcf86cd799439011'
            family.children![0].id = '507f1f77bcf86cd799439011'
            return Promise.resolve(family)
        } else if (familyId === '507f1f77bcf86cd799439015') {
            const family: Family = new FamilyMock()
            family.children = undefined
            return Promise.resolve(family)
        } else if (familyId === '507f1f77bcf86cd799439016')
            throw new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED)
        return Promise.resolve(undefined!)
    }

    public findOne(query: any): Promise<Family> {
        const id: string = query.filters._id
        if (id === '507f1f77bcf86cd799439011') {
            const family: Family = new FamilyMock()
            return Promise.resolve(family)
        }
        return Promise.resolve(undefined!)
    }

    public update(family: Family): Promise<Family> {
        if (family.id === '507f1f77bcf86cd799439013') return Promise.resolve(undefined!)
        return Promise.resolve(family)
    }

    public findAll(query: any): Promise<Array<Family>> {
        return this.find(query)
    }
}
