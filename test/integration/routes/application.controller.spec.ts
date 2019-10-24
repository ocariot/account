import { expect } from 'chai'
import { App } from '../../../src/app'
import { Identifier } from '../../../src/di/identifiers'
import { DIContainer } from '../../../src/di/di'
import { Institution } from '../../../src/application/domain/model/institution'
import { Application } from '../../../src/application/domain/model/application'
import { UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { ObjectID } from 'bson'
import { ApplicationMock } from '../../mocks/application.mock'
import { Strings } from '../../../src/utils/strings'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { Default } from '../../../src/utils/default'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Application', () => {

    const institution: Institution = new Institution()

    const defaultApplication: Application = new ApplicationMock()

    before(async () => {
            try {
                await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                    { interval: 100 })

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
            } catch (err) {
                throw new Error('Failure on Application test: ' + err.message)
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
            throw new Error('Failure on Application test: ' + err.message)
        }
    })

    describe('POST /v1/applications', () => {
        context('when posting a new application without institution', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }
            })
            it('should return status code 201 and the saved application', () => {

                const body = {
                    username: defaultApplication.username,
                    password: 'mysecretkey',
                    application_name: defaultApplication.application_name
                }

                return request
                    .post('/v1/applications')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultApplication.username)
                        expect(res.body.application_name).to.eql(defaultApplication.application_name)
                    })
            })
        })

        context('when posting a new application user', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }
            })
            it('should return status code 201 and the saved application', () => {
                const body = {
                    username: defaultApplication.username,
                    password: 'mysecretkey',
                    application_name: defaultApplication.application_name,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/applications')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultApplication.username)
                        expect(res.body.institution_id).to.eql(institution.id)
                        expect(res.body.application_name).to.eql(defaultApplication.application_name)
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    await createUser({
                        username: defaultApplication.username,
                        password: 'mysecretkey',
                        application_name: defaultApplication.application_name,
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }
            })
            it('should return status code 409 and message info about duplicate items', () => {
                const body = {
                    username: defaultApplication.username,
                    password: 'mysecretkey',
                    application_name: defaultApplication.application_name,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/applications')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.APPLICATION.ALREADY_REGISTERED)
                    })
            })
        })

        context('when a validation error occurs', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {
                const body = {
                    username: defaultApplication.username,
                    password: 'mysecretkey',
                    application_name: '',
                    institution_id: institution.id
                }

                return request
                    .post('/v1/applications')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Application name field is invalid...')
                        expect(err.body.description).to.eql('Application name must have at least one character.')
                    })
            })
        })

        context('when a validation error occurs (application_name is invalid)', () => {
            it('should return status code 400 and message info about the invalid application_name parameters', () => {
                const body = {
                    password: 'mysecretkey',
                    application_name: defaultApplication.application_name
                }

                return request
                    .post('/v1/applications')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Application validation: username is required!')
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {
                const body = {
                    username: 'anotherusername',
                    password: 'mysecretkey',
                    application_name: defaultApplication.application_name,
                    institution_id: new ObjectID()
                }

                return request
                    .post('/v1/applications')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.REGISTER_REQUIRED)
                        expect(err.body.description).to.eql(Strings.INSTITUTION.ALERT_REGISTER_REQUIRED)
                    })
            })
        })

        context('when the institution id provided was invalid', () => {
            it('should return status code 400 and message for invalid institution id', () => {
                const body = {
                    username: 'anotherusername',
                    password: 'mysecretkey',
                    application_name: defaultApplication.application_name,
                    institution_id: '123'
                }

                return request
                    .post('/v1/applications')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('GET /v1/applications/:application_id', () => {
        context('when get an unique application in database', () => {
            let result
            before(async () => {
                try {
                    await deleteAllUsers()

                    result = await createUser({
                        username: defaultApplication.username,
                        password: 'mysecretkey',
                        application_name: defaultApplication.application_name,
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }
            })
            it('should return status code 200 and an application', () => {
                return request
                    .get(`/v1/applications/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultApplication.username)
                        expect(res.body.institution_id).to.eql(institution.id)
                        expect(res.body.application_name).to.eql(defaultApplication.application_name)
                    })
            })
        })

        context('when the application is not found', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }
            })
            it('should return status code 404 and info message from application not found', () => {
                return request
                    .get(`/v1/applications/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.APPLICATION.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.APPLICATION.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the application_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .get('/v1/applications/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.APPLICATION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('RABBITMQ PUBLISHER -> PATCH /v1/applications/:application_id', () => {
        context('when this application is updated successfully and published to the bus', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()

                    result = await createUser({
                        username: defaultApplication.username,
                        password: 'mysecretkey',
                        application_name: defaultApplication.application_name,
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and with the same values as the application ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subUpdateApplication(message => {
                        try {
                            expect(message.event_name).to.eql('ApplicationUpdateEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('application')
                            expect(message.application).to.have.property('id')
                            expect(message.application.username).to.eql('new_username')
                            expect(message.application.institution_id).to.eql(institution.id)
                            expect(message.application.application_name).to.eql(defaultApplication.application_name)
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .patch(`/v1/applications/${result.id}`)
                            .send({ username: 'new_username' })
                            .set('Content-Type', 'application/json')
                            .expect(200)
                            .then()
                            .catch(done)
                    })
                    .catch(done)
            })
        })
    })

    describe('PATCH /v1/applications/:application_id', () => {
        context('when the update was successful (there is no connection to RabbitMQ)', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()

                    result = await createUser({
                        username: defaultApplication.username,
                        password: 'mysecretkey',
                        application_name: defaultApplication.application_name,
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }
            })
            it('should return status code 200 and updated application (and show an error log about unable to send ' +
                'UpdateApplication event)', () => {
                return request
                    .patch(`/v1/applications/${result.id}`)
                    .send({ username: 'other_username', last_login: defaultApplication.last_login })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql('other_username')
                        expect(res.body.institution_id).to.eql(institution.id)
                        expect(res.body.application_name).to.eql(defaultApplication.application_name)
                    })
            })
        })

        context('when a duplication error occurs', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()

                    await createUser({
                        username: 'acoolusername',
                        password: 'mysecretkey',
                        application_name: defaultApplication.application_name,
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })

                    result = await createUser({
                        username: defaultApplication.username,
                        password: 'mysecretkey',
                        application_name: defaultApplication.application_name,
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }
            })
            it('should return status code 409 and info message from duplicate value', () => {
                return request
                    .patch(`/v1/applications/${result.id}`)
                    .send({ username: 'acoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.APPLICATION.ALREADY_REGISTERED)
                    })
            })
        })

        context('when a validation error occurs', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {
                const body = {
                    password: 'mysecretkey'
                }

                return request
                    .patch(`/v1/applications/${defaultApplication.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('This parameter could not be updated.')
                        expect(err.body.description).to.eql('A specific route to update user password already exists.' +
                            `Access: PATCH /users/${defaultApplication.id}/password to update your password.`)
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {
                return request
                    .patch(`/v1/applications/${defaultApplication.id}`)
                    .send({ institution_id: new ObjectID() })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.REGISTER_REQUIRED)
                        expect(err.body.description).to.eql(Strings.INSTITUTION.ALERT_REGISTER_REQUIRED)
                    })
            })
        })

        context('when the institution id provided was invalid', () => {
            it('should return status code 400 and message for invalid institution id', () => {
                return request
                    .patch(`/v1/applications/${defaultApplication.id}`)
                    .send({ institution_id: '123' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the application is not found', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }
            })
            it('should return status code 404 and info message from application not found', () => {
                return request
                    .patch(`/v1/applications/${new ObjectID()}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.APPLICATION.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.APPLICATION.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the application_name is invalid', () => {
            it('should return status code 400 and info message from invalid application_name', () => {
                return request
                    .patch(`/v1/applications/${defaultApplication.id}`)
                    .send({ application_name: ''})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Application name field is invalid...')
                        expect(err.body.description).to.eql('Application name must have at least one character.')
                    })
            })
        })

        context('when the application_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch('/v1/applications/123')
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.APPLICATION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('GET /v1/applications/', () => {
        context('when want get all applications in database', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    await createUser({
                        username: 'APP0002',
                        password: 'mysecretkey',
                        application_name: 'Scale',
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })

                    await createUser({
                        username: 'APP0003',
                        password: 'mysecretkey',
                        application_name: 'Raspberry Pi 4',
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })

                    await createUser({
                        username: 'APP0004',
                        password: 'mysecretkey',
                        application_name: 'Raspberry Pi 2',
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })

                    await createUser({
                        username: 'APP0001',
                        password: 'mysecretkey',
                        application_name: 'Raspberry Pi 3 b+',
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }
            })
            it('should return status code 200 and a list of applications', () => {
                return request
                    .get('/v1/applications')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(4)
                        for (const application of res.body) {
                            expect(application).to.have.property('id')
                            expect(application).to.have.property('username')
                            expect(application).to.have.property('institution_id')
                            expect(application).to.have.property('application_name')
                        }
                    })
            })
        })

        context('when use query strings and find users in the database', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    await createUser({
                        username: 'APP0002',
                        password: 'mysecretkey',
                        application_name: 'Scale',
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })

                    await createUser({
                        username: 'APP0003',
                        password: 'mysecretkey',
                        application_name: 'Raspberry Pi 4',
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })

                    await createUser({
                        username: 'APP0004',
                        password: 'mysecretkey',
                        application_name: 'Raspberry Pi 2',
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })

                    await createUser({
                        username: 'APP0001',
                        password: 'mysecretkey',
                        application_name: 'Raspberry Pi 3 b+',
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    })
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }
            })
            it('should return the result as required in query (query the application that has username exactly ' +
                'the same as the given string)', () => {
                const url: string = '/v1/applications?username=APP0004&sort=username&limit=3'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].username).to.eql('APP0004')
                        expect(res.body[0].institution_id).to.eql(institution.id)
                        expect(res.body[0].application_name).to.eql('Raspberry Pi 2')
                    })
            })

            it('should return an empty array (when not find any application)', () => {
                const url = '/v1/applications?username=*PB*&sort=username&page=1&limit=3'
                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        context('when there are no applications in the database', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }
            })
            it('should return status code 200 and an empty array', () => {
                return request
                    .get('/v1/applications')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
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
