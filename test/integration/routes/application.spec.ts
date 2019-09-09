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
    defaultApplication.password = 'application_password'

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
                        defaultApplication.id = res.body.id
                    })
            })
        })

        context('when posting a new application user', () => {
            before(() => {
                try {
                    deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
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
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
                        expect(res.body.application_name).to.eql(defaultApplication.application_name)
                        defaultApplication.id = res.body.id
                    })
            })
        })

        context('when a duplicate error occurs', () => {
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
            it('should return status code 400 and message info about missing or invalid  parameters', () => {
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
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('GET /applications/:application_id', () => {
        context('when get a unique application in database', () => {
            it('should return status code 200 and a application', () => {
                return request
                    .get(`/v1/applications/${defaultApplication.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultApplication.id)
                        expect(res.body.username).to.eql(defaultApplication.username)
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
                        expect(res.body.application_name).to.eql(defaultApplication.application_name)
                    })
            })
        })

        context('when the application is not found', () => {
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

    describe('PATCH /applications/:application_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and updated application', () => {
                return request
                    .patch(`/v1/applications/${defaultApplication.id}`)
                    .send({ last_login: defaultApplication.last_login })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultApplication.id)
                        expect(res.body.username).to.eql(defaultApplication.username)
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
                        expect(res.body.application_name).to.eql(defaultApplication.application_name)
                        expect(res.body.last_login).to.eql(defaultApplication.last_login!.toISOString())
                    })
            })
        })

        context('when a duplication error occurs', () => {
            it('should return status code 409 and info message from duplicate value', async () => {
                try {
                    await createUser({
                        username: 'acoolusername',
                        password: 'mysecretkey',
                        application_name: defaultApplication.application_name,
                        institution: new ObjectID(institution.id),
                        type: UserType.APPLICATION
                    }).then()
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }

                return request
                    .patch(`/v1/applications/${defaultApplication.id}`)
                    .send({ username: 'acoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql('Application is already registered!')
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
                    .post('/v1/applications')
                    .send({ institution_id: '123' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the application is not found', () => {
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

        context('when the application_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch('/v1/applications/123')
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('GET /v1/applications/', () => {
        context('when want get all applications in database', () => {
            it('should return status code 200 and a list of applications', () => {
                return request
                    .get('/v1/applications')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution_id')
                        expect(res.body[0]).to.have.property('application_name')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution_id')
                        expect(res.body[1]).to.have.property('application_name')
                        expect(res.body[1]).to.have.property('last_login')
                    })
            })
        })

        context('when use query strings', () => {
            it('should return the result as required in query', async () => {
                try {
                    await createInstitution({
                        type: 'Home',
                        name: 'Sherlock Neighbor',
                        address: '221A Baker Street, St.',
                        latitude: 1,
                        longitude: 1
                    }).then(result => {
                        createUser({
                            username: 'ihaveaunknowusername',
                            password: 'mysecretkey',
                            application_name: 'app01',
                            institution: new ObjectID(result._id),
                            type: UserType.APPLICATION,
                            last_login: defaultApplication.last_login
                        }).then()
                    })
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }

                const url: string = '/v1/applications?application_name=app01&sort=username&page=1&limit=3'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0].username).to.eql('ihaveaunknowusername')
                        expect(res.body[0]).to.have.property('institution_id')
                        expect(res.body[0]).to.have.property('last_login')
                    })
            })
        })

        context('when there are no applications in database', () => {
            it('should return status code 200 and a empty array', async () => {
                try {
                    await deleteAllUsers().then()
                } catch (err) {
                    throw new Error('Failure on Application test: ' + err.message)
                }

                return request
                    .get('/v1/applications')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(0)
                    })
            })
        })
    })
})

async function createUser(item) {
    return await UserRepoModel.create(item)
}

async function deleteAllUsers() {
    return await UserRepoModel.deleteMany({})
}

async function createInstitution(item) {
    return await InstitutionRepoModel.create(item)
}

async function deleteAllInstitutions() {
    return await InstitutionRepoModel.deleteMany({})
}
