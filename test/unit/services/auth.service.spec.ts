import sinon from 'sinon'
import { assert } from 'chai'
import { IAuthService } from '../../../src/application/port/auth.service.interface'
import { AuthService } from '../../../src/application/service/auth.service'
import { IAuthRepository } from '../../../src/application/port/auth.repository.interface'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { AuthRepositoryMock } from '../../mocks/auth.repository.mock'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'

require('sinon-mongoose')

describe('Services: Auth', () => {
    let username: string = 'valid_username'
    let password: string = 'valid_password'
    const jwtKey: string = 'eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1NTM4NjMwNDksImV4cCI6MTU4NTM5OTA0OSwiYXVkIjo' +
                           'id3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIl' +
                           'N1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQc' +
                           'm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.8O3oPX1BDTvRbuvofW6PPSLyolNkjYzoD7xzykGtcQk'

    const modelFake: any = UserRepoModel
    const authRepo: IAuthRepository = new AuthRepositoryMock()

    const authService: IAuthService = new AuthService(authRepo)

    afterEach(() => {
        sinon.restore()
    })

    /**
     * Method "authenticate(username: string, password: string)"
     */
    describe('authenticate(username: string, password: string)', () => {
        context('when the parameters are valid', () => {
            it('should throw a ValidationException', async () => {
                const query: IQuery = new Query()
                query.filters = { _username: username }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(jwtKey)

                return authService.authenticate(username, password)
                    .then(result => {
                        assert.propertyVal(result, 'access_token', jwtKey)
                    })
            })
        })

        context('when the parameters are invalid (the username is invalid)', () => {
            it('should return undefined', async () => {
                username = 'invalid_username'
                const query: IQuery = new Query()
                query.filters = { _username: username }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(undefined)

                return authService.authenticate(username, password)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the parameters are invalid (missing fields)', () => {
            it('should throw a ValidationException', async () => {
                username = ''
                password = ''
                const query: IQuery = new Query()
                query.filters = { _username: username }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .rejects({
                        message: 'Required fields were not provided...',
                        description: 'Authentication validation: username, password is required!'
                    })

                try {
                    return await authService.authenticate(username, password)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Required fields were not provided...')
                    assert.propertyVal(err, 'description', 'Authentication validation: username, password is required!')
                }
            })
        })
    })
})
