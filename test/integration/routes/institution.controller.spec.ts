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
import { InstitutionMock } from '../../mocks/institution.mock'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Institution', () => {

    const defaultInstitution: Institution = new InstitutionMock()

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
            before(async () => {
                try {
                    await deleteAllInstitutions()
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })
            it('should return status code 201 and the saved institution', () => {
                const body = {
                    type: defaultInstitution.type,
                    name: defaultInstitution.name,
                    address: defaultInstitution.address,
                    latitude: defaultInstitution.latitude,
                    longitude: defaultInstitution.longitude
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
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await deleteAllInstitutions()

                    await createInstitution({
                        type: defaultInstitution.type,
                        name: defaultInstitution.name,
                        address: defaultInstitution.address,
                        latitude: defaultInstitution.latitude,
                        longitude: defaultInstitution.longitude
                    })
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })

            it('should return status code 409 and info message about duplicate items', () => {
                const body = {
                    type: defaultInstitution.type,
                    name: defaultInstitution.name,
                    address: defaultInstitution.address,
                    latitude: defaultInstitution.latitude,
                    longitude: defaultInstitution.longitude
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
                const body = {}

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

        context('when a validation error occurs (institution name is invalid)', () => {
            it('should return status code 400 and info message from invalid name', () => {
                const body = {
                    type: defaultInstitution.type,
                    name: '',
                    address: defaultInstitution.address,
                    latitude: defaultInstitution.latitude,
                    longitude: defaultInstitution.longitude
                }

                return request
                    .post('/v1/institutions')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Institution name field is invalid...')
                        expect(err.body.description).to.eql('Institution name must have at least one character.')
                    })
            })
        })

        context('when a validation error occurs (institution type is invalid)', () => {
            it('should return status code 400 and info message from invalid type', () => {
                const body = {
                    type: '',
                    name: defaultInstitution.name,
                    address: defaultInstitution.address,
                    latitude: defaultInstitution.latitude,
                    longitude: defaultInstitution.longitude
                }

                return request
                    .post('/v1/institutions')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Institution type field is invalid...')
                        expect(err.body.description).to.eql('Institution type must have at least one character.')
                    })
            })
        })
    })

    describe('GET /v1/institutions/:institution_id', () => {
        context('when get an unique institution in database', () => {
            let resultInstitution

            before(async () => {
                try {
                    await deleteAllInstitutions()

                    resultInstitution = await createInstitution({
                        type: defaultInstitution.type,
                        name: defaultInstitution.name,
                        address: defaultInstitution.address,
                        latitude: defaultInstitution.latitude,
                        longitude: defaultInstitution.longitude
                    })
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })
            it('should return status code 200 and an institution', () => {
                return request
                    .get(`/v1/institutions/${resultInstitution.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
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
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.INSTITUTION.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the institution id is in invalid format', () => {
            it('should return status code 400 and info message from invalid ID format', () => {
                return request
                    .get('/v1/institutions/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('PATCH /v1/institutions/:institution_id', () => {
        context('when the update was successful', () => {
            let resultInstitution

            before(async () => {
                try {
                    await deleteAllInstitutions()

                    resultInstitution = await createInstitution({
                        type: defaultInstitution.type,
                        name: defaultInstitution.name,
                        address: defaultInstitution.address,
                        latitude: defaultInstitution.latitude,
                        longitude: defaultInstitution.longitude
                    })
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })
            it('should return status code 200 and an updated institution', () => {
                return request
                    .patch(`/v1/institutions/${resultInstitution.id}`)
                    .send({ type: 'Another Cool Type' })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.type).to.eql('Another Cool Type')
                        expect(res.body.name).to.eql(defaultInstitution.name)
                        expect(res.body.address).to.eql(defaultInstitution.address)
                        expect(res.body.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when a duplication error occurs', () => {
            let resultInstitution

            before(async () => {
                try {
                    await deleteAllInstitutions()

                    resultInstitution = await createInstitution({
                        type: defaultInstitution.type,
                        name: defaultInstitution.name,
                        address: defaultInstitution.address,
                        latitude: defaultInstitution.latitude,
                        longitude: defaultInstitution.longitude
                    })

                    await createInstitution({
                            type: 'Any Type',
                            name: 'Other Name',
                            address: '221A Baker Street, St.',
                            latitude: 0,
                            longitude: 0
                        }
                    )
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })
            it('should return status code 409 and info message from duplicate items', () => {
                return request
                    .patch(`/v1/institutions/${resultInstitution.id}`)
                    .send({ name: 'Other Name' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the institution is not found', () => {
            before(async () => {
                try {
                    await deleteAllInstitutions()
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })
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

        context('when the institution name is invalid', () => {
            it('should return status code 400 and info message from invalid name', () => {
                return request
                    .patch(`/v1/institutions/${defaultInstitution.id}`)
                    .send({ name: '' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Institution name field is invalid...')
                        expect(err.body.description).to.eql('Institution name must have at least one character.')
                    })
            })
        })

        context('when the institution type is invalid', () => {
            it('should return status code 400 and info message from invalid type', () => {
                return request
                    .patch(`/v1/institutions/${defaultInstitution.id}`)
                    .send({ type: '' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Institution type field is invalid...')
                        expect(err.body.description).to.eql('Institution type must have at least one character.')
                    })
            })
        })
    })

    describe('RABBITMQ PUBLISHER -> DELETE /v1/institutions/:institution_id', () => {
        context('when the institution was deleted successfully and your ID is published on the bus', () => {
            let resultInstitution

            before(async () => {
                try {
                    await deleteAllInstitutions()

                    resultInstitution = await createInstitution({
                        type: defaultInstitution.type,
                        name: defaultInstitution.name,
                        address: defaultInstitution.address,
                        latitude: defaultInstitution.latitude,
                        longitude: defaultInstitution.longitude
                    })

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
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
                            expect(message.institution).to.have.property('id')
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .delete(`/v1/institutions/${resultInstitution.id}`)
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
        context('when the deletion was successful (there is no connection to RabbitMQ)', () => {
            let resultInstitution

            before(async () => {
                try {
                    await deleteAllInstitutions()

                    resultInstitution = await createInstitution({
                        type: defaultInstitution.type,
                        name: defaultInstitution.name,
                        address: defaultInstitution.address,
                        latitude: defaultInstitution.latitude,
                        longitude: defaultInstitution.longitude
                    })
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })
            it('should return status code 204 and no content (and show an error log about unable to send ' +
                'DeleteInstitution event)', () => {
                return request
                    .delete(`/v1/institutions/${resultInstitution.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the institution was associated with an user', () => {
            let resultInstitution

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllInstitutions()

                    resultInstitution = await createInstitution({
                        type: defaultInstitution.type,
                        name: defaultInstitution.name,
                        address: defaultInstitution.address,
                        latitude: defaultInstitution.latitude,
                        longitude: defaultInstitution.longitude
                    })

                    await createUser({
                        username: 'child_username',
                        password: 'child_password',
                        type: UserType.CHILD,
                        gender: 'male',
                        age: 11,
                        institution: new ObjectID(resultInstitution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })
            it('should return status code 400 and info message from existent association', () => {
                return request
                    .delete(`/v1/institutions/${resultInstitution.id}`)
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
            before(async () => {
                try {
                    await deleteAllInstitutions()

                    await createInstitution({
                        type: 'Default_type',
                        name: 'Default_institution',
                        address: defaultInstitution.address,
                        latitude: defaultInstitution.latitude,
                        longitude: defaultInstitution.longitude
                    })

                    await createInstitution({
                        type: 'another_type',
                        name: 'another_institution',
                        address: defaultInstitution.address,
                        latitude: defaultInstitution.latitude,
                        longitude: defaultInstitution.longitude
                    })
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })
            it('should return status code 200 and a list of institutions sorted by name', () => {
                return request
                    .get('/v1/institutions?sort=name')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).is.eql(2)
                        for (const institution of res.body) {
                            expect(institution).to.have.property('id')
                            expect(institution).to.have.property('type')
                            expect(institution).to.have.property('name')
                            expect(institution).to.have.property('address')
                            expect(institution).to.have.property('latitude')
                            expect(institution).to.have.property('longitude')
                        }

                        expect(res.body[0].name).to.eql('another_institution')
                        expect(res.body[1].name).to.eql('Default_institution')
                    })
            })

            it('should return status code 200 and a list of institutions sorted by type', () => {
                return request
                    .get('/v1/institutions?sort=type')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).is.eql(2)
                        for (const institution of res.body) {
                            expect(institution).to.have.property('id')
                            expect(institution).to.have.property('type')
                            expect(institution).to.have.property('name')
                            expect(institution).to.have.property('address')
                            expect(institution).to.have.property('latitude')
                            expect(institution).to.have.property('longitude')
                        }

                        expect(res.body[0].type).to.eql('another_type')
                        expect(res.body[1].type).to.eql('Default_type')
                    })
            })
        })

        context('when use query strings', () => {
            before(async () => {
                try {
                    await deleteAllInstitutions()

                    await createInstitution({
                        type: 'School Institution',
                        name: 'INSTBR00010',
                        address: defaultInstitution.address,
                        latitude: defaultInstitution.latitude,
                        longitude: defaultInstitution.longitude
                    })

                    await createInstitution({
                        type: defaultInstitution.type,
                        name: 'INSTBR0001',
                        address: defaultInstitution.address,
                        latitude: defaultInstitution.latitude,
                        longitude: defaultInstitution.longitude
                    })

                    await createInstitution({
                        type: defaultInstitution.type,
                        name: 'INSTBR0002',
                        address: defaultInstitution.address,
                        latitude: defaultInstitution.latitude,
                        longitude: defaultInstitution.longitude
                    })
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })
            it('should return the result as required in query (query the institutions that has name exactly ' +
                'the same as the given string)', () => {
                const url: string = '/v1/institutions?name=INSTBR0001&sort=name&limit=3'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].type).to.eql(defaultInstitution.type)
                        expect(res.body[0].name).to.eql('INSTBR0001')
                        expect(res.body[0].address).to.eql(defaultInstitution.address)
                        expect(res.body[0].latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[0].longitude).to.eql(defaultInstitution.longitude)
                    })
            })

            it('should return the result as required in query (query a maximum of two institutions who have a particular ' +
                'string anywhere in their name, sorted in descending order by this name)', () => {
                const url: string = '/v1/institutions?name=*BR*&sort=-name&limit=2'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).is.eql(2)
                        for (const institution of res.body) {
                            expect(institution).to.have.property('id')
                            expect(institution).to.have.property('type')
                            expect(institution).to.have.property('name')
                            expect(institution).to.have.property('address')
                            expect(institution).to.have.property('latitude')
                            expect(institution).to.have.property('longitude')
                        }

                        expect(res.body[0].name).to.eql('INSTBR00010')
                        expect(res.body[0].type).to.eql('School Institution')
                        expect(res.body[1].name).to.eql('INSTBR0002')
                        expect(res.body[1].type).to.eql(defaultInstitution.type)
                    })
            })

            it('should return an empty array (when not find any institution)', () => {
                const url: string = '/v1/institutions?name=*PB*&sort=username&limit=3'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        context('when there are no institutions in the database', () => {
            before(async () => {
                try {
                    await deleteAllInstitutions()
                } catch (err) {
                    throw new Error('Failure on Institution test: ' + err.message)
                }
            })
            it('should return status code 200 and an empty array', () => {
                return request
                    .get('/v1/institutions')
                    .set('Content-Type', 'application/json')
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
