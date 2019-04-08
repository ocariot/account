import { expect } from 'chai'
import { App } from '../../../src/app'
import { Identifier } from '../../../src/di/identifiers'
import { DI } from '../../../src/di/di'
import { IConnectionDB } from '../../../src/infrastructure/port/connection.db.interface'
import { Container } from 'inversify'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { UserType } from '../../../src/application/domain/model/user'
import { Admin } from '../../../src/application/domain/model/admin'
import { IUserRepository } from '../../../src/application/port/user.repository.interface'

const container: Container = DI.getInstance().getContainer()
const dbConnection: IConnectionDB = container.get(Identifier.MONGODB_CONNECTION)
const userService: IUserRepository = container.get(Identifier.USER_REPOSITORY)
const app: App = container.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Auth', () => {
    before(async () => {
            try {
                await dbConnection.tryConnect(0, 500)

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

    describe('POST /auth', () => {
        context('when the authentication was successful', () => {
            it('should return the access token', () => {
                request
                    .post('/auth')
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
                    .post('/auth')
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
                    .post('/auth')
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(res => {
                        expect(res.body.message).to.eql('Required fields were not provided...')
                        expect(res.body.description).to.eql('Authentication validation: username, password is required!')
                    })
            })
        })
    })
})

async function deleteAllUsers() {
    return await UserRepoModel.deleteMany({})
}
