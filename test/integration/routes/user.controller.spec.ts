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
import { Gender } from '../../../src/application/domain/model/child'
import { Query } from '../../../src/infrastructure/repository/query/query'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const userRepository: IUserRepository = DIContainer.get(Identifier.USER_REPOSITORY)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

const institution: Institution = new Institution()

describe('Routes: User', () => {

    const defaultUser: Admin = new Admin().fromJSON({
        username: 'admin',
        password: 'mysecretkey',
        type: UserType.ADMIN
    })

    before(async () => {
            try {
                await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

                await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })

                await deleteAllUsers()
                await deleteAllInstitutions()
                const item = await createInstitution({
                    type: 'Any Type',
                    name: 'Name Example',
                    address: '221B Baker Street, St.',
                    latitude: 0,
                    longitude: 0
                })

                institution.id = item._id.toString()

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

        context('when there are validation errors (missing parameters)', () => {
            it('should return status code 400 and info message from invalid or missing parameters', () => {
                return request
                    .put(`/v1/users/${defaultUser.id}/password`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'old_password, new_password'))
                    })
            })
        })

        context('when there are validation errors (old_password is invalid)', () => {
            it('should return status code 400 and info message from invalid old_password', () => {
                return request
                    .put(`/v1/users/${defaultUser.id}/password`)
                    .send({ old_password: '' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.EMPTY_STRING
                            .replace('{0}', 'old_password'))
                    })
            })
        })

        context('when there are validation errors (new_password is invalid)', () => {
            it('should return status code 400 and info message from invalid new_password', () => {
                return request
                    .put(`/v1/users/${defaultUser.id}/password`)
                    .send({ new_password: '' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.EMPTY_STRING
                            .replace('{0}', 'new_password'))
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

        context('when there are validation errors (missing parameters)', () => {
            it('should return status code 400 and info message from invalid or missing parameters', () => {
                return request
                    .post(`/v1/users/${defaultUser.id}/reset-password`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required field not provided...')
                        expect(err.body.description).to.eql('new_password is required!')
                    })
            })
        })

        context('when there are validation errors (new_password is invalid)', () => {
            it('should return status code 400 and info message from invalid new_password', () => {
                return request
                    .post(`/v1/users/${defaultUser.id}/reset-password`)
                    .send({ new_password: '' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.EMPTY_STRING
                            .replace('{0}', 'new_password'))
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

    describe('POST /v1/users/types/:user_type/scopes', () => {
        context('when the scopes update was successful', () => {
            before(async () => {
                try {
                    await createManyUsers()
                } catch (err) {
                    throw new Error('Failure on User routes test: ' + err.message)
                }
            })

            it('should return status code 204 and no content (admin users)', () => {
                const scopesToBeInserted = Default.ADMIN_SCOPES.slice(0, Default.ADMIN_SCOPES.length - 1)
                scopesToBeInserted.push('notifications:create')

                return request
                    .post(`/v1/users/types/${UserType.ADMIN}/scopes`)
                    .send({ scopes: scopesToBeInserted })
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                        userRepository.find(new Query().fromJSON({ filters: { type: UserType.ADMIN } }))
                            .then(users => {
                                for (const user of users) {
                                    expect(user.scopes.length).to.eql(Default.ADMIN_SCOPES.length)
                                }
                            })
                    })
            })

            it('should return status code 204 and no content (application users)', () => {
                const scopesToBeInserted = Default.APPLICATION_SCOPES.slice(0, Default.APPLICATION_SCOPES.length - 1)
                scopesToBeInserted.push('external:sync')

                return request
                    .post(`/v1/users/types/${UserType.APPLICATION}/scopes`)
                    .send({ scopes: scopesToBeInserted })
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                        userRepository.find(new Query().fromJSON({ filters: { type: UserType.APPLICATION } }))
                            .then(users => {
                                for (const user of users) {
                                    expect(user.scopes.length).to.eql(Default.APPLICATION_SCOPES.length)
                                }
                            })
                    })
            })

            it('should return status code 204 and no content (child users)', () => {
                const scopesToBeInserted = Default.CHILD_SCOPES.slice(0, Default.CHILD_SCOPES.length - 1)
                scopesToBeInserted.push('notifications:create')

                return request
                    .post(`/v1/users/types/${UserType.CHILD}/scopes`)
                    .send({ scopes: scopesToBeInserted })
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                        userRepository.find(new Query().fromJSON({ filters: { type: UserType.CHILD } }))
                            .then(users => {
                                for (const user of users) {
                                    expect(user.scopes.length).to.eql(Default.CHILD_SCOPES.length)
                                }
                            })
                    })
            })

            it('should return status code 204 and no content (educator users)', () => {
                const scopesToBeInserted = Default.EDUCATOR_SCOPES.slice(0, Default.EDUCATOR_SCOPES.length - 1)
                scopesToBeInserted.push('notifications:create')

                return request
                    .post(`/v1/users/types/${UserType.EDUCATOR}/scopes`)
                    .send({ scopes: scopesToBeInserted })
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                        userRepository.find(new Query().fromJSON({ filters: { type: UserType.EDUCATOR } }))
                            .then(users => {
                                for (const user of users) {
                                    expect(user.scopes.length).to.eql(Default.EDUCATOR_SCOPES.length)
                                }
                            })
                    })
            })

            it('should return status code 204 and no content (family users)', () => {
                const scopesToBeInserted = Default.FAMILY_SCOPES.slice(0, Default.FAMILY_SCOPES.length - 1)
                scopesToBeInserted.push('notifications:create')

                return request
                    .post(`/v1/users/types/${UserType.FAMILY}/scopes`)
                    .send({ scopes: scopesToBeInserted })
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                        userRepository.find(new Query().fromJSON({ filters: { type: UserType.FAMILY } }))
                            .then(users => {
                                for (const user of users) {
                                    expect(user.scopes.length).to.eql(Default.FAMILY_SCOPES.length)
                                }
                            })
                    })
            })

            it('should return status code 204 and no content (health professional users)', () => {
                const scopesToBeInserted = Default.HEALTH_PROF_SCOPES.slice(0, Default.HEALTH_PROF_SCOPES.length - 1)
                scopesToBeInserted.push('notifications:create')

                return request
                    .post(`/v1/users/types/${UserType.HEALTH_PROFESSIONAL}/scopes`)
                    .send({ scopes: scopesToBeInserted })
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                        userRepository.find(new Query().fromJSON({ filters: { type: UserType.HEALTH_PROFESSIONAL } }))
                            .then(users => {
                                for (const user of users) {
                                    expect(user.scopes.length).to.eql(Default.HEALTH_PROF_SCOPES.length)
                                }
                            })
                    })
            })
        })

        context('when there is no user in the repository', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on User routes test: ' + err.message)
                }
            })

            it('should return status code 204 and no content (admin users)', () => {
                const scopesToBeInserted = Default.ADMIN_SCOPES.slice()
                scopesToBeInserted.push('notifications:create')

                return request
                    .post(`/v1/users/types/${UserType.ADMIN}/scopes`)
                    .send({ scopes: scopesToBeInserted })
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when there are validation errors', () => {
            before(async () => {
                try {
                    await createManyUsers()
                } catch (err) {
                    throw new Error('Failure on User routes test: ' + err.message)
                }
            })

            it('should return status code 400 and info message about error (invalid user type)', () => {
                return request
                    .post(`/v1/users/types/invalidUserType/scopes`)
                    .send({ scopes: ['testscope:readAll'] })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(res => {
                        expect(res.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(res.body.description).to.eql(`The user types allowed are: ${Object.values(UserType).join(', ')}.`)
                    })
            })

            it('should return status code 400 and info message about error (undefined scopes array)', () => {
                return request
                    .post(`/v1/users/types/${UserType.ADMIN}/scopes`)
                    .send({ scopes: undefined })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(res => {
                        expect(res.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES)
                        expect(res.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_1)
                    })
            })

            it('should return status code 400 and info message about error (empty scopes array)', () => {
                return request
                    .post(`/v1/users/types/${UserType.ADMIN}/scopes`)
                    .send({ scopes: [] })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(res => {
                        expect(res.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES)
                        expect(res.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_1)
                    })
            })

            it('should return status code 400 and info message about error (invalid scope(s) for admin users)',
                () => {
                    const invalidScopes = Default.ADMIN_SCOPES.slice()
                    invalidScopes.push('physicalactivities:create')
                    invalidScopes.push('external:sync')

                    return request
                        .post(`/v1/users/types/${UserType.ADMIN}/scopes`)
                        .send({ scopes: invalidScopes })
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES)
                            expect(res.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_2
                                .replace('{0}', 'physicalactivities:create, external:sync')
                                .replace('{1}', UserType.ADMIN))
                        })
                })

            it('should return status code 400 and info message about error (invalid scope(s) for application users)',
                () => {
                    const invalidScopes = Default.APPLICATION_SCOPES.slice()
                    invalidScopes.push('applications:readAll')
                    invalidScopes.push('notifications:create')

                    return request
                        .post(`/v1/users/types/${UserType.APPLICATION}/scopes`)
                        .send({ scopes: invalidScopes })
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES)
                            expect(res.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_2
                                .replace('{0}', 'applications:readAll, notifications:create')
                                .replace('{1}', UserType.APPLICATION))
                        })
                })

            it('should return status code 400 and info message about error (invalid scope(s) for child users)',
                () => {
                    const invalidScopes = Default.CHILD_SCOPES.slice()
                    invalidScopes.push('children:create')
                    invalidScopes.push('children:readAll')
                    invalidScopes.push('physicalactivities:delete')

                    return request
                        .post(`/v1/users/types/${UserType.CHILD}/scopes`)
                        .send({ scopes: invalidScopes })
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES)
                            expect(res.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_2
                                .replace('{0}', 'children:create, children:readAll, ' +
                                    'physicalactivities:delete')
                                .replace('{1}', UserType.CHILD))
                        })
                })

            it('should return status code 400 and info message about error (invalid scope(s) for educator users)',
                () => {
                    const invalidScopes = Default.EDUCATOR_SCOPES.slice()
                    invalidScopes.push('educators:create')
                    invalidScopes.push('educators:readAll')

                    return request
                        .post(`/v1/users/types/${UserType.EDUCATOR}/scopes`)
                        .send({ scopes: invalidScopes })
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES)
                            expect(res.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_2
                                .replace('{0}', 'educators:create, educators:readAll')
                                .replace('{1}', UserType.EDUCATOR))
                        })
                })

            it('should return status code 400 and info message about error (invalid scope(s) for family users)',
                () => {
                    const invalidScopes = Default.FAMILY_SCOPES.slice()
                    invalidScopes.push('families:create')
                    invalidScopes.push('families:readAll')

                    return request
                        .post(`/v1/users/types/${UserType.FAMILY}/scopes`)
                        .send({ scopes: invalidScopes })
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES)
                            expect(res.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_2
                                .replace('{0}', 'families:create, families:readAll')
                                .replace('{1}', UserType.FAMILY))
                        })
                })

            it('should return status code 400 and info message about error (invalid scope(s) for health professional users)',
                () => {
                    const invalidScopes = Default.HEALTH_PROF_SCOPES.slice()
                    invalidScopes.push('healthprofessionals:create')
                    invalidScopes.push('healthprofessionals:readAll')

                    return request
                        .post(`/v1/users/types/${UserType.HEALTH_PROFESSIONAL}/scopes`)
                        .send({ scopes: invalidScopes })
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES)
                            expect(res.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_2
                                .replace('{0}', 'healthprofessionals:create, healthprofessionals:readAll')
                                .replace('{1}', UserType.HEALTH_PROFESSIONAL))
                        })
                })
        })
    })

    describe('RABBITMQ PUBLISHER -> DELETE /v1/users/:user_id', () => {
        context('when the user was deleted successfully and your ID is published on the bus', () => {
            let resultUser

            before(async () => {
                try {
                    resultUser = await createUser({
                            username: 'acoolusername',
                            password: 'mysecretkey',
                            application_name: 'Any Name',
                            institution: institution.id,
                            type: UserType.APPLICATION
                        }
                    )

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on User routes test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on User test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and that has the same ID ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subDeleteUser(message => {
                        try {
                            expect(message.event_name).to.eql('UserDeleteEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('user')
                            expect(message.user).to.have.property('id')
                            expect(message.user.type).to.eql(UserType.APPLICATION)
                            expect(message.user.username).to.eql('acoolusername')
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .delete(`/v1/users/${resultUser.id}`)
                            .set('Content-Type', 'application/json')
                            .expect(204)
                            .then()
                            .catch(done)
                    })
                    .catch(done)
            })
        })
    })

    describe('DELETE /v1/users/:user_id', () => {
        context('when the user was successful deleted (there is no connection to RabbitMQ)', () => {
            it('should return status code 204 and no content for admin user (and show an error log about unable to send ' +
                'DeleteUser event)', () => {
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
                        institution: institution.id
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
            it('should return status code 400 and info message from invalid user id', () => {
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
    return UserRepoModel.create(item)
}

async function deleteAllUsers() {
    return UserRepoModel.deleteMany({})
}

async function createInstitution(item) {
    return InstitutionRepoModel.create(item)
}

async function deleteAllInstitutions() {
    return InstitutionRepoModel.deleteMany({})
}

async function createManyUsers() {
    await deleteAllUsers()

    // Create admin users
    await createUser({
            username: 'admin01',
            password: 'mysecretkey',
            institution: institution.id,
            type: UserType.ADMIN,
            scopes: Default.ADMIN_SCOPES
        }
    )

    await createUser({
            username: 'admin02',
            password: 'mysecretkey',
            institution: institution.id,
            type: UserType.ADMIN,
            scopes: Default.ADMIN_SCOPES
        }
    )

    // Create application users
    await createUser({
            username: 'app01',
            password: 'mysecretkey',
            institution: institution.id,
            application_name: 'application_name',
            type: UserType.APPLICATION,
            scopes: Default.APPLICATION_SCOPES
        }
    )

    await createUser({
            username: 'app02',
            password: 'mysecretkey',
            institution: institution.id,
            application_name: 'application_name',
            type: UserType.APPLICATION,
            scopes: Default.APPLICATION_SCOPES
        }
    )

    // Create child users
    await createUser({
            username: 'child01',
            password: 'mysecretkey',
            institution: institution.id,
            gender: Gender.MALE,
            age: 9,
            age_calc_date: '2020-04-10',
            type: UserType.CHILD,
            scopes: Default.CHILD_SCOPES
        }
    )

    await createUser({
            username: 'child02',
            password: 'mysecretkey',
            institution: institution.id,
            gender: Gender.FEMALE,
            age: 10,
            age_calc_date: '2020-04-10',
            type: UserType.CHILD,
            scopes: Default.CHILD_SCOPES
        }
    )

    // Create educator users
    await createUser({
            username: 'edu01',
            password: 'mysecretkey',
            institution: institution.id,
            type: UserType.EDUCATOR,
            scopes: Default.EDUCATOR_SCOPES
        }
    )

    await createUser({
            username: 'edu02',
            password: 'mysecretkey',
            institution: institution.id,
            type: UserType.EDUCATOR,
            scopes: Default.EDUCATOR_SCOPES
        }
    )

    // Create family users
    await createUser({
            username: 'fam01',
            password: 'mysecretkey',
            institution: institution.id,
            type: UserType.FAMILY,
            scopes: Default.FAMILY_SCOPES
        }
    )

    await createUser({
            username: 'fam02',
            password: 'mysecretkey',
            institution: institution.id,
            type: UserType.FAMILY,
            scopes: Default.FAMILY_SCOPES
        }
    )

    // Create health professional users
    await createUser({
            username: 'hprof01',
            password: 'mysecretkey',
            institution: institution.id,
            type: UserType.HEALTH_PROFESSIONAL,
            scopes: Default.HEALTH_PROF_SCOPES
        }
    )

    await createUser({
            username: 'hprof02',
            password: 'mysecretkey',
            institution: institution.id,
            type: UserType.HEALTH_PROFESSIONAL,
            scopes: Default.HEALTH_PROF_SCOPES
        }
    )
}
