import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { UserType } from '../../../src/application/domain/model/user'
import { Admin } from '../../../src/application/domain/model/admin'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { IUserRepository } from '../../../src/application/port/user.repository.interface'
import { ObjectID } from 'bson'
import { Institution } from '../../../src/application/domain/model/institution'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { Strings } from '../../../src/utils/strings'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { Default } from '../../../src/utils/default'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const userRepository: IUserRepository = DIContainer.get(Identifier.USER_REPOSITORY)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: User', () => {

    const defaultUser: Admin = new Admin().fromJSON({
        username: 'admin',
        password: 'mysecretkey',
        type: UserType.ADMIN
    })

    const institution: Institution = new Institution()

    before(async () => {
            try {
                await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)
                await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI, { sslOptions: { ca: [] } })
                await deleteAllUsers()
                await deleteAllInstitutions()
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
                throw new Error('Failure on User test: ' + err.message)
            }
        }
    )

    after(async () => {
        try {
            await deleteAllUsers()
            await deleteAllInstitutions()
            await dbConnection.dispose()
            await rabbitmq.dispose()
        } catch (err) {
            throw new Error('Failure on User test: ' + err.message)
        }
    })

    describe('PUT /v1/users/:user_id/password', () => {
        context('when the password update was successful', () => {
            it('should return status code 204 and no content', () => {
                return request
                    .put(`/v1/users/${defaultUser.id}/password`)
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
                    .put(`/v1/users/${defaultUser.id}/password`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Change password validation failed: old_password, ' +
                            'new_password is required!')
                    })
            })
        })

        context('when user is not found', () => {
            it('should return status code 404 and info message from user not found', () => {
                return request
                    .put(`/v1/users/${new ObjectID()}/password`)
                    .send({ old_password: 'mysecretkey', new_password: 'mynewsecretkey' })
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.USER.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.USER.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the old password does not match', () => {
            it('should return status code 400 and info message from old password does not match', () => {
                return request
                    .put(`/v1/users/${defaultUser.id}/password`)
                    .send({ old_password: 'anothersecretkey', new_password: 'mynewsecretkey' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.USER.PASSWORD_NOT_MATCH)
                        expect(err.body.description).to.eql(Strings.USER.PASSWORD_NOT_MATCH_DESCRIPTION)
                    })
            })
        })
    })

    describe('POST /v1/users/:user_id/reset-password', () => {
        context('when the password reset was successful', () => {
            it('should return status code 204 and no content', () => {
                return request
                    .post(`/v1/users/${defaultUser.id}/reset-password`)
                    .send({ new_password: 'mynewsecretkey' })
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when there are validation errors (user id is invalid)', () => {
            it('should return status code 400 and info message from invalid or missing parameters', () => {
                return request
                    .post(`/v1/users/123/reset-password`)
                    .send({ new_password: 'mynewsecretkey' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.USER.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when there are validation errors', () => {
            it('should return status code 400 and info message from invalid or missing parameters', () => {
                return request
                    .post(`/v1/users/${defaultUser.id}/reset-password`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required field not provided...')
                        expect(err.body.description).to.eql('Reset password validation failed: ' +
                            'new_password is required!')
                    })
            })
        })

        context('when user is not found', () => {
            it('should return status code 404 and info message from user not found', () => {
                return request
                    .post(`/v1/users/${new ObjectID()}/reset-password`)
                    .send({ new_password: 'mynewsecretkey' })
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.USER.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.USER.NOT_FOUND_DESCRIPTION)
                    })
            })
        })
    })

    describe('DELETE /v1/users/:user_id', () => {
        context('when the user was successful deleted', () => {
            it('should return status code 204 and no content for admin user', () => {
                return request
                    .delete(`/v1/users/${defaultUser.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })

            it('should return status code 204 and no content for application user', async () => {
                try {
                    await createUser({
                        username: 'acoolusername',
                        password: 'mysecretkey',
                        application_name: 'Any Name',
                        institution: institution.id,
                        type: UserType.APPLICATION
                    }).then(user => {
                        return request
                            .delete(`/v1/users/${user._id}`)
                            .set('Content-Type', 'application/json')
                            .expect(204)
                            .then(res => {
                                expect(res.body).to.eql({})
                            })
                    })
                } catch (err) {
                    throw new Error('Failure on User test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for admin user', async () => {
                const admin = defaultUser.toJSON()
                admin.username = 'anotheradminuser'
                admin.password = 'mysecretkey'
                admin.institution = institution.id
                admin.scopes = ['users:read']

                try {
                    await createUser(admin)
                        .then(user => {
                            return request
                                .delete(`/v1/users/${user._id}`)
                                .set('Content-Type', 'application/json')
                                .expect(204)
                                .then(res => {
                                    expect(res.body).to.eql({})
                                })
                        })
                } catch (err) {
                    throw new Error('Failure on User test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for child user', async () => {
                try {
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
                            .delete(`/v1/users/${user._id}`)
                            .set('Content-Type', 'application/json')
                            .expect(204)
                            .then(res => {
                                expect(res.body).to.eql({})
                            })
                    })
                } catch (err) {
                    throw new Error('Failure on User test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for educator user', async () => {
                try {
                    await createUser({
                        username: 'acoolusername',
                        password: 'mysecretkey',
                        type: UserType.EDUCATOR,
                        institution: institution.id,
                        scopes: new Array('users:read'),
                        children_groups: []
                    }).then(user => {
                        return request
                            .delete(`/v1/users/${user._id}`)
                            .set('Content-Type', 'application/json')
                            .expect(204)
                            .then(res => {
                                expect(res.body).to.eql({})
                            })
                    })
                } catch (err) {
                    throw new Error('Failure on User test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for health professional user', async () => {
                try {
                    await createUser({
                        username: 'mydefaultusername',
                        password: 'mysecretkey',
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: institution.id,
                        scopes: new Array('users:read'),
                        children_groups: []
                    }).then(user => {
                        return request
                            .delete(`/v1/users/${user._id}`)
                            .set('Content-Type', 'application/json')
                            .expect(204)
                            .then(res => {
                                expect(res.body).to.eql({})
                            })
                    })
                } catch (err) {
                    throw new Error('Failure on User test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for family user', async () => {
                try {
                    await createUser({
                        username: 'mydefaultusername',
                        password: 'mysecretkey',
                        type: UserType.FAMILY,
                        institution: institution.id,
                        scopes: new Array('users:read'),
                        children: []
                    }).then(user => {
                        return request
                            .delete(`/v1/users/${user._id}`)
                            .set('Content-Type', 'application/json')
                            .expect(204)
                            .then(res => {
                                expect(res.body).to.eql({})
                            })
                    })
                } catch (err) {
                    throw new Error('Failure on User test: ' + err.message)
                }
            })
        })

        context('when user is not founded', () => {
            it('should return status code 204 and no content, even user does not exists', () => {
                return request
                    .delete(`/v1/users/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when there are validation errors (user id is invalid)', () => {
            it('should return status code 204 and no content, even user does not exists', () => {
                return request
                    .delete(`/v1/users/123}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.USER.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})

async function createUser(item) {
    return await UserRepoModel.create(item)
}

async function deleteAllUsers() {
    return UserRepoModel.deleteMany({})
}

async function createInstitution(item) {
    return await InstitutionRepoModel.create(item)
}

async function deleteAllInstitutions() {
    return InstitutionRepoModel.deleteMany({})
}
