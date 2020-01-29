import { expect } from 'chai'
import { App } from '../../../src/app'
import { Identifier } from '../../../src/di/identifiers'
import { DIContainer } from '../../../src/di/di'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { UserType } from '../../../src/application/domain/model/user'
import { Admin } from '../../../src/application/domain/model/admin'
import { IUserRepository } from '../../../src/application/port/user.repository.interface'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { Default } from '../../../src/utils/default'
import { Strings } from '../../../src/utils/strings'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const userService: IUserRepository = DIContainer.get(Identifier.USER_REPOSITORY)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Auth', () => {
    before(async () => {
            try {
                await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)
                await deleteAllUsers()

                const item: Admin = new Admin()
                item.username = 'admin'
                item.password = 'mysecretkey'
                item.type = UserType.ADMIN

                await userService.create(item)
            } catch (err) {
                throw new Error('Failure on Auth test: ' + err.message)
            }
        }
    )

    after(async () => {
        try {
            await deleteAllUsers()
            await dbConnection.dispose()
        } catch (err) {
            throw new Error('Failure on Auth test: ' + err.message)
        }
    })

    describe('POST /v1/auth', () => {
        context('when the authentication was successful', () => {
            it('should return the access token', () => {
                request
                    .post('/v1/auth')
                    .send({ username: 'admin', password: 'mysecretkey' })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token')
                    })
            })
        })

        context('when the username or password does not exists', () => {
            it('should return status code 401 and info message about unauthorized', () => {
                request
                    .post('/v1/auth')
                    .send({ username: 'any', password: 'any' })
                    .set('Content-Type', 'application/json')
                    .expect(401)
                    .then(res => {
                        expect(res.body.message).to.eql('Invalid username or password!')
                    })
            })
        })

        context('when there are validation errors in authentication', () => {
            it('should return status code 400 and info message about validation errors', () => {
                request
                    .post('/v1/auth')
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(res => {
                        expect(res.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(res.body.description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'username, password'))
                    })
            })
        })
    })
})

async function deleteAllUsers() {
    return UserRepoModel.deleteMany({})
}
