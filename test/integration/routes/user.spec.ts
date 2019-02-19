import { expect } from 'chai'
import { Container } from 'inversify'
import { DI } from '../../../src/di/di'
import { IDBConnection } from '../../../src/infrastructure/port/db.connection.interface'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { UserType } from '../../../src/application/domain/model/user'
import { Admin } from '../../../src/application/domain/model/admin'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { IUserRepository } from '../../../src/application/port/user.repository.interface'
import { ObjectID } from 'bson'
import { Institution } from '../../../src/application/domain/model/institution'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'

const container: Container = DI.getInstance().getContainer()
const dbConnection: IDBConnection = container.get(Identifier.MONGODB_CONNECTION)
const userRepository: IUserRepository = container.get(Identifier.USER_REPOSITORY)
const app: App = container.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: User', () => {

    const defaultUser: Admin = new Admin()
    defaultUser.username = 'admin'
    defaultUser.password = 'mysecretkey'
    defaultUser.type = UserType.ADMIN

    const institution: Institution = new Institution()

    before(async () => {
            try {
                await dbConnection.tryConnect()
                await deleteAllUsers({})
                await deleteAllInstitutions({})
                const item = await createInstitution({
                    type: 'Any Type',
                    name: 'Name Example',
                    address: '221B Baker Street, St.',
                    latitude: 0,
                    longitude: 0
                })

                institution.id = item._id

                const user = await userRepository.create(defaultUser)
                defaultUser.id = user.id
            } catch (err) {
                throw new Error('Failure on Application test: ' + err.message)
            }
        }
    )

    after(async () => {
        try {
            await deleteAllUsers({})
            await deleteAllInstitutions({})
            await dbConnection.dispose()
        } catch (err) {
            throw new Error('Failure on Child test: ' + err.message)
        }
    })

    describe('PATCH /users/:user_id/password', () => {
        context('when the password update was successful', () => {
            it('should return status code 204 and no content', () => {
                return request
                    .patch(`/users/${defaultUser.id}/password`)
                    .send({ old_password: 'mysecretkey', new_password: 'mynewsecretkey' })
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when there are validation errors', () => {
            it('should return status code 400 and info message from invalid or missing parameters', () => {
                return request
                    .patch(`/users/${defaultUser.id}/password`)
                    .send({ new_password: 'mynewsecretkey' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when user is not found', () => {
            it('should return status code 404 and info message from user not found', () => {
                return request
                    .patch(`/users/${new ObjectID()}/password`)
                    .send({ old_password: 'mysecretkey', new_password: 'mynewsecretkey' })
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the old password does not match', () => {
            it('should return status code 400 and info message from old password does not match', () => {
                return request
                    .patch(`/users/${defaultUser.id}/password`)
                    .send({ old_password: 'anothersecretkey', new_password: 'mynewsecretkey' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('DELETE /users/:user_id', () => {
        context('when the user was successful deleted', () => {
            it('should return status code 204 and no content for admin user', () => {
                return request
                    .delete(`/users/${defaultUser.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('should return status code 204 and no content for application user', async () => {
                await createUser({
                    username: 'acoolusername',
                    password: 'mysecretkey',
                    application_name: 'Any Name',
                    institution: institution.id,
                    type: UserType.APPLICATION
                }).then(user => {
                    return request
                        .delete(`/users/${user._id}`)
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })
            })

            it('should return status code 204 and no content for child user', async () => {
                await createUser({
                    username: 'anotherusername',
                    password: 'mysecretkey',
                    type: UserType.CHILD,
                    gender: 'male',
                    age: 11,
                    institution: institution.id,
                    scopes: new Array('users:read')
                }).then(user => {
                    return request
                        .delete(`/users/${user._id}`)
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })
            })

            it('should return status code 204 and no content for educator user', async () => {
                await createUser({
                    username: 'acoolusername',
                    password: 'mysecretkey',
                    type: UserType.EDUCATOR,
                    institution: institution.id,
                    scopes: new Array('users:read'),
                    children_groups: []
                }).then(user => {
                    return request
                        .delete(`/users/${user._id}`)
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })
            })

            it('should return status code 204 and no content for health professional user', async () => {
                await createUser({
                    username: 'mydefaultusername',
                    password: 'mysecretkey',
                    type: UserType.HEALTH_PROFESSIONAL,
                    institution: institution.id,
                    scopes: new Array('users:read'),
                    children_groups: []
                }).then(user => {
                    return request
                        .delete(`/users/${user._id}`)
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })
            })

            it('should return status code 204 and no content for family user', async () => {
                await createUser({
                    username: 'mydefaultusername',
                    password: 'mysecretkey',
                    type: UserType.FAMILY,
                    institution: institution.id,
                    scopes: new Array('users:read'),
                    children: []
                }).then(user => {
                    return request
                        .delete(`/users/${user._id}`)
                        .set('Content-Type', 'application/json')
                        .expect(204)
                        .then(res => {
                            expect(res.body).to.eql({})
                        })
                })
            })
        })

        context('when user is not founded', () => {
            it('should return status code 204 and no content, even user does not exists', () => {
                return request
                    .delete(`/users/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })
    })
})

async function createUser(item) {
    return await UserRepoModel.create(item)
}

async function deleteAllUsers(doc) {
    return await UserRepoModel.deleteMany(doc)
}

async function createInstitution(item) {
    return await InstitutionRepoModel.create(item)
}

async function deleteAllInstitutions(doc) {
    return await InstitutionRepoModel.deleteMany(doc)
}
