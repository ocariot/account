import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { Institution } from '../../../src/application/domain/model/institution'
import { ObjectID } from 'bson'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { UserType } from '../../../src/application/domain/model/user'
import { Strings } from '../../../src/utils/strings'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { Default } from '../../../src/utils/default'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Institution', () => {

    const defaultInstitution: Institution = new Institution()
    defaultInstitution.type = 'Any Type'
    defaultInstitution.name = 'Name Example'
    defaultInstitution.address = '221B Baker Street, St.'
    defaultInstitution.latitude = 0
    defaultInstitution.longitude = 0

    const anotherInstitution: Institution = new Institution()

    before(async () => {
            try {
                await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                    { interval: 100 })

                await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })

                await deleteAllUsers()
                await deleteAllInstitutions()
            } catch (err) {
                throw new Error('Failure on Institution test: ' + err.message)
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
            throw new Error('Failure on Institution test: ' + err.message)
        }
    })

    describe('POST /v1/institutions', () => {
        context('when posting a new institution', () => {
            it('should return status code 201 and the saved institution', () => {
                const body = {
                    type: 'Any Type',
                    name: 'Name Example',
                    address: '221B Baker Street, St.',
                    latitude: 0,
                    longitude: 0
                }

                return request
                    .post('/v1/institutions')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.type).to.eql(defaultInstitution.type)
                        expect(res.body.name).to.eql(defaultInstitution.name)
                        expect(res.body.address).to.eql(defaultInstitution.address)
                        expect(res.body.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.longitude).to.eql(defaultInstitution.longitude)
                        defaultInstitution.id = res.body.id
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and info message about duplicate items', () => {
                const body = {
                    type: 'Any Type',
                    name: 'Name Example',
                    address: '221B Baker Street, St.',
                    latitude: 0,
                    longitude: 0
                }

                return request
                    .post('/v1/institutions')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.ALREADY_REGISTERED)
                    })
            })
        })

        context('when a validation error occurs', () => {
            it('should return status code 400 and info message from invalid or missing parameters', () => {
                const body = {
                }

                return request
                    .post('/v1/institutions')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Institution validation: name, type is required!')
                    })
            })
        })
    })

    describe('GET /v1/institutions/:institution_id', () => {
        context('when get a unique institution in database', () => {
            it('should return status code 200 and a institution', () => {
                return request
                    .get(`/v1/institutions/${defaultInstitution.id}`)
                    .set('Content-Type', 'application/json')
                    .then(res => {
                        expect(res.body.id).to.eql(defaultInstitution.id)
                        expect(res.body.type).to.eql(defaultInstitution.type)
                        expect(res.body.name).to.eql(defaultInstitution.name)
                        expect(res.body.address).to.eql(defaultInstitution.address)
                        expect(res.body.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when the institution is not found', () => {
            it('should return status code 404 and info message from institution not found', () => {
                return request
                    .get(`/v1/institutions/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.INSTITUTION.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the institution is in invalid format', () => {
            it('should return status code 400 and info message from invalid ID format', () => {
                return request
                    .get('/v1/institutions/123')
                    .set('Content-Type', 'application/json')
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('PATCH /v1/institutions/:institution_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and a updated institution', () => {
                defaultInstitution.type = 'Another Cool Type'

                return request
                    .patch(`/v1/institutions/${defaultInstitution.id}`)
                    .send({ type: 'Another Cool Type' })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultInstitution.id)
                        expect(res.body.type).to.eql(defaultInstitution.type)
                        expect(res.body.name).to.eql(defaultInstitution.name)
                        expect(res.body.address).to.eql(defaultInstitution.address)
                        expect(res.body.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when a duplication error occurs', () => {
            it('should return status code 409 and info message from duplicate items', async () => {
                try {
                    await createInstitution({
                            type: 'Any Type',
                            name: 'Other Name',
                            address: '221A Baker Street, St.',
                            latitude: 0,
                            longitude: 0
                        }
                    ).then(item => {
                        anotherInstitution.id = item._id
                    })
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }

                return request
                    .patch(`/v1/institutions/${defaultInstitution.id}`)
                    .send({ name: 'Other Name' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the institution is not found', () => {
            it('should return status code 404 and info message from institution not found', () => {
                return request
                    .patch(`/v1/institutions/${new ObjectID()}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.INSTITUTION.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the institution_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch('/v1/institutions/123')
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('NO CONNECTION TO RABBITMQ -> DELETE /v1/institutions/:institution_id', () => {
        context('when the deletion was successful', () => {
            before(async () => {
                try {
                //
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })
            it('should return status code 204 and no content (and show an error log about unable to send ' +
                'DeleteInstitution event)', () => {
                return request
                    .delete(`/v1/institutions/${anotherInstitution.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })
    })

    describe('RABBITMQ PUBLISHER -> DELETE /v1/institutions/:institution_id', () => {
        context('when the institution was deleted successfully and your ID is published on the bus', () => {
            before(async () => {
                try {
                    await createInstitution({
                            type: 'Any Type',
                            name: 'Other Name',
                            address: '221A Baker Street, St.',
                            latitude: 0,
                            longitude: 0
                        }
                    ).then(item => {
                        anotherInstitution.id = item._id
                    })

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on Institution routes test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and that has the same ID ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subDeleteInstitution(message => {
                        try {
                            expect(message.event_name).to.eql('InstitutionDeleteEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('institution')
                            anotherInstitution.id = message.institution.id
                            expect(message.institution.id).to.eql(anotherInstitution.id)
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .delete(`/v1/institutions/${anotherInstitution.id}`)
                            .set('Content-Type', 'application/json')
                            .expect(204)
                            .then()
                            .catch(done)
                    })
                    .catch(done)
            })
        })
    })

    describe('DELETE /v1/institutions/:institution_id', () => {
        context('when the deletion was successful', () => {
            before(async () => {
                try {
                    await createInstitution({
                            type: 'Any Type',
                            name: 'Other Name',
                            address: '221A Baker Street, St.',
                            latitude: 0,
                            longitude: 0
                        }
                    ).then(item => {
                        anotherInstitution.id = item._id
                    })
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })
            it('should return status code 204 and no content', () => {
                return request
                    .delete(`/v1/institutions/${anotherInstitution.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the institution was associated with an user', () => {
            it('should return status code 400 and info message from existent association', async () => {
                try {
                    await createUser({
                        username: 'anothercoolusername',
                        password: 'mysecretkey',
                        type: UserType.CHILD,
                        gender: 'male',
                        age: 11,
                        institution: defaultInstitution.id,
                        scopes: new Array('users:read')
                    }).then()
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }

                return request
                    .delete(`/v1/institutions/${defaultInstitution.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.HAS_ASSOCIATION)
                    })
            })
        })

        context('when the institution is not found', () => {
            it('should return status code 204 and no content, even the institution was not founded', () => {
                return request
                    .delete(`/v1/institutions/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the institution_id is invalid', () => {
            it('should return status code 400 and info message from invalid ID', () => {
                return request
                    .delete('/v1/institutions/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('GET /v1/institutions', () => {
        context('when want get all institutions in database', () => {
            it('should return status coe 200 and a list of institutions', () => {
                return request
                    .get('/v1/institutions')
                    .set('Content-Type', 'application/json')
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).is.eql(1)
                        expect(res.body[0].id).to.eql(defaultInstitution.id)
                        expect(res.body[0].type).to.eql(defaultInstitution.type)
                        expect(res.body[0].name).to.eql(defaultInstitution.name)
                        expect(res.body[0].address).to.eql(defaultInstitution.address)
                        expect(res.body[0].latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[0].longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when does not have users in database', () => {
            it('should return status code 200 and a empty array', async () => {
                try {
                    await deleteAllInstitutions().then()
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }

                return request
                    .get('/v1/institutions')
                    .set('Content-Type', 'application/json')
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).is.eql(0)
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
