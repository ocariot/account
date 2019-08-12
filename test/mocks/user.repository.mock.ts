import { IUserRepository } from '../../src/application/port/user.repository.interface'
import { User } from '../../src/application/domain/model/user'
import { UserMock, UserTypeMock } from './user.mock'

export class UserRepositoryMock implements IUserRepository {

    public changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
        return Promise.resolve(oldPassword === newPassword ||
            Promise.resolve(oldPassword !== newPassword))
    }

    public comparePasswords(passwordPlain: string, passwordHash: string): boolean {
        return passwordHash === passwordPlain
    }

    public encryptUsername(username: string): string {
        return username
    }

    public decryptUsername(encryptedUsername: string): string {
        return encryptedUsername
    }

    public encryptPassword(password: string): string {
        return password
    }

    public findById(userId: string): Promise<User> {
        const user = new UserMock()
        user.id = userId

        if (userId === '507f1f77bcf86cd799439011') {
            user.type = UserTypeMock.APPLICATION
        } else if (userId === '507f1f77bcf86cd799439012') {
            user.type = UserTypeMock.CHILD
        } else if (userId === '507f1f77bcf86cd799439013') {
            user.type = UserTypeMock.EDUCATOR
        } else if (userId === '507f1f77bcf86cd799439014') {
            user.type = UserTypeMock.FAMILY
        } else if (userId === '507f1f77bcf86cd799439015') {
            user.type = UserTypeMock.HEALTH_PROFESSIONAL
        }

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
        const id: string = (query.filters)._id
        const childrenArr: Array<User> = new Array<UserMock>()
        // Only for the test case that returns a filled array
        if (id === '507f1f77bcf86cd799439011') {
            for (let i = 0; i < 3; i++) {
                childrenArr.push(new UserMock())
            }
        }
        return Promise.resolve(childrenArr)
    }

    public findOne(query: any): Promise<User> {
        const id: string = query.filters._id
        if (id === '507f1f77bcf86cd799439011') {
            const user = new UserMock()
            user.id = query.id
            return Promise.resolve(user)
        }
        return Promise.resolve(undefined!)
    }

    public update(item: User): Promise<User> {
        return Promise.resolve(item)
    }
}
