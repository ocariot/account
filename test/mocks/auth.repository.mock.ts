import { IAuthRepository } from '../../src/application/port/auth.repository.interface'
import { User } from '../../src/application/domain/model/user'
import { UserMock } from './user.mock'

export class AuthRepositoryMock implements IAuthRepository {
    public authenticate(username: string, password: string): Promise<object> {
        if (username === 'valid_username') {
            const user: User = new UserMock()
            return Promise.resolve({ access_token: this.generateAccessToken(user) })
        }
        return Promise.resolve(undefined!)
    }

    public generateAccessToken(user: User): string {
        return 'eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1NTM4NjMwNDksImV4cCI6MTU4NTM5OTA0OSwiYXVkIjoid3d3LmV4YW' +
               '1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJ' +
               'FbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.8O3oPX1B' +
               'DTvRbuvofW6PPSLyolNkjYzoD7xzykGtcQk'
    }

}
