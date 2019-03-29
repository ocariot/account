import { IUserRepository } from '../../src/application/port/user.repository.interface'
import { User } from '../../src/application/domain/model/user'
import { UserMock } from './user.mock'

export class UserRepositoryMock implements IUserRepository {

    public changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
        return Promise.resolve(oldPassword === newPassword ||
            Promise.resolve(oldPassword !== newPassword))
    }

    public comparePasswords(passwordPlain: string, passwordHash: string): boolean {
        return passwordHash === passwordPlain
    }

    public encryptPassword(password: string): string {
        return password
    }

    public findById(userId: string): Promise<User> {
        const user = new UserMock()
        user.id = userId
        return Promise.resolve(user)
    }

    public hasInstitution(institutionId: string): Promise<boolean> {
        return Promise.resolve(institutionId === '507f1f77bcf86cd799439011')
    }

    public count(query: any): Promise<number> {
        return Promise.resolve(1)
    }

    public create(item: User): Promise<User> {
        return Promise.resolve(item)
    }

    public delete(id: string): Promise<boolean> {
        return Promise.resolve(id !== '')
    }

    public find(query: any): Promise<Array<User>> {
        return Promise.resolve([])
    }

    public findOne(query: any): Promise<User> {
        const user = new UserMock()
        user.id = query.id
        return Promise.resolve(user)
    }

    public update(item: User): Promise<User> {
        return Promise.resolve(item)
    }
}
