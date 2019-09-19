import { Institution } from '../../../src/application/domain/model/institution'
import { UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { Child } from '../../../src/application/domain/model/child'
import { expect } from 'chai'
import { ObjectID } from 'bson'
import { ChildMock } from '../../mocks/child.mock'
import { Strings } from '../../../src/utils/strings'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { Default } from '../../../src/utils/default'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Child', () => {
    const institution: Institution = new Institution()

    const defaultChild: Child = new ChildMock()
    defaultChild.password = 'child_password'

    before(async () => {
            try {
                await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                    { interval: 100 })
                await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                    { interval: 100, sslOptions: { ca: [] } })
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
                throw new Error('Failure on Child test: ' + err.message)
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
            throw new Error('Failure on Child test: ' + err.message)
        }
    })

    describe('NO CONNECTION TO RABBITMQ -> POST /v1/children', () => {
        context('when posting a new child user', () => {
            before(async () => {
                try {
                    await rabbitmq.dispose()

                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return status code 201 and the saved child (and show an error log about unable to send ' +
                'SaveChild event)', () => {
                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
                        defaultChild.id = res.body.id
                    })
            })
        })
    })

    describe('RABBITMQ PUBLISHER -> POST /v1/children', () => {
        context('when posting a new child user and publishing it to the bus', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and with the same values as the child ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subSaveChild(message => {
                        try {
                            expect(message.event_name).to.eql('ChildSaveEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('child')
                            defaultChild.id = message.child.id
                            expect(message.child.id).to.eql(defaultChild.id)
                            expect(message.child.username).to.eql(defaultChild.username)
                            expect(message.child.gender).to.eql(defaultChild.gender)
                            expect(message.child.age).to.eql(defaultChild.age)
                            expect(message.child.institution_id).to.eql(institution.id!.toString())
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .post('/v1/children')
                            .send({
                                username: defaultChild.username,
                                password: defaultChild.password,
                                gender: defaultChild.gender,
                                age: defaultChild.age,
                                institution_id: institution.id
                            })
                            .set('Content-Type', 'application/json')
                            .expect(201)
                            .then()
                    })
                    .catch(done)
            })
        })
    })

    describe('POST /v1/children', () => {
        context('when posting a new child user', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    await rabbitmq.dispose()

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return status code 201 and the saved child', () => {
                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
                        defaultChild.id = res.body.id
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and message info about duplicate items', () => {
                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.ALREADY_REGISTERED)
                    })
            })
        })

        context('when a validation error occurs', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {
                const body = {}

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Child validation: username, password, institution, gender, ' +
                            'age is required!')
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: new ObjectID()
                }

                return request
                    .post('/v1/children')
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
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: '123'
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the gender provided was invalid', () => {
            it('should return status code 400 and message for invalid gender', () => {

                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: 'invalid_gender',
                    age: defaultChild.age,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('The gender provided "invalid_gender" is not supported...')
                        expect(err.body.description).to.eql('The names of the allowed genders are: male, female.')
                    })
            })
        })

        context('when the age provided was invalid', () => {
            it('should return status code 400 and message for invalid gender', () => {

                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: -1,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Age field is invalid...')
                        expect(err.body.description).to.eql(
                            'Child validation: The age parameter can only contain a value greater than zero.')
                    })
            })
        })
    })

    describe('GET /v1/children/:child_id', () => {
        context('when get a unique child in database', () => {
            it('should return status code 200 and a child', () => {
                return request
                    .get(`/v1/children/${defaultChild.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
                    })
            })
        })

        context('when the child is not found', () => {
            it('should return status code 404 and info message from child not found', () => {
                return request
                    .get(`/v1/children/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.CHILD.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the child_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {
                return request
                    .get('/v1/children/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('NO CONNECTION TO RABBITMQ -> PATCH /v1/children/:child_id', () => {
        context('when the update was successful', () => {
            before(async () => {
                try {
                    await rabbitmq.dispose()

                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return status code 200 and updated child (and show an error log about unable to send ' +
                'UpdateChild event)', () => {
                return request
                    .patch(`/v1/children/${defaultChild.id}`)
                    .send({ last_login: defaultChild.last_login, last_sync: defaultChild.last_sync })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
                    })
            })
        })
    })

    describe('RABBITMQ PUBLISHER -> PATCH /v1/children/:child_id', () => {
        context('when this child is updated successfully and published to the bus', () => {
            before(async () => {
                try {
                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and with the same values as the child ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subUpdateChild(message => {
                        try {
                            expect(message.event_name).to.eql('ChildUpdateEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('child')
                            expect(message.child.id).to.eql(defaultChild.id)
                            expect(message.child.username).to.eql(defaultChild.username)
                            expect(message.child.gender).to.eql(defaultChild.gender)
                            expect(message.child.age).to.eql(defaultChild.age)
                            expect(message.child.institution_id).to.eql(institution.id!.toString())
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .patch(`/v1/children/${defaultChild.id}`)
                            .send({ last_login: defaultChild.last_login, last_sync: defaultChild.last_sync })
                            .set('Content-Type', 'application/json')
                            .expect(200)
                            .then()
                    })
                    .catch(done)
            })
        })
    })

    describe('PATCH /v1/children/:child_id', () => {
        context('when the update was successful', () => {
            before(async () => {
                try {
                    await rabbitmq.dispose()

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return status code 200 and updated child', () => {
                return request
                    .patch(`/v1/children/${defaultChild.id}`)
                    .send({ last_login: defaultChild.last_login, last_sync: defaultChild.last_sync })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
                    })
            })
        })

        context('when a duplication error occurs', () => {
            it('should return status code 409 and info message from duplicate value', async () => {
                try {
                    await createUser({
                        username: 'anothercoolusername',
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: institution.id,
                        scopes: new Array('users:read')
                    }).then()
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }

                return request
                    .patch(`/v1/children/${defaultChild.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql('Child is already registered!')
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {
                return request
                    .patch(`/v1/children/${defaultChild.id}`)
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
                    .patch(`/v1/children/${defaultChild.id}`)
                    .send({ institution_id: '123' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the child is not found', () => {
            it('should return status code 404 and info message from child not found', () => {
                return request
                    .patch(`/v1/children/${new ObjectID()}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.CHILD.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the child_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch('/v1/children/123')
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

    describe('GET /v1/children', () => {
        context('when want get all children in database', () => {
            it('should return status code 200 and a list of children', () => {
                return request
                    .get('/v1/children')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution_id')
                        expect(res.body[0]).to.have.property('age')
                        expect(res.body[0]).to.have.property('gender')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution_id')
                        expect(res.body[1]).to.have.property('age')
                        expect(res.body[1]).to.have.property('gender')
                    })
            })
        })

        context(' when use query strings', () => {
            it('should return the result as required in query', async () => {
                try {
                    await createInstitution({
                        type: 'School',
                        name: 'UEPB Kids',
                        address: '221A Baker Street, St.',
                        latitude: 1,
                        longitude: 1
                    }).then(result => {
                        createUser({
                            username: 'ihaveauniqueusername',
                            password: defaultChild.password,
                            type: UserType.CHILD,
                            gender: defaultChild.gender,
                            age: 10,
                            institution: result._id,
                            scopes: new Array('users:read'),
                            last_login: defaultChild.last_login,
                            last_sync: defaultChild.last_sync
                        }).then()
                    })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }

                const url = '/v1/children?age=lte:11&sort=age,username' +
                    '&page=1&limit=3'
                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(3)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution_id')
                        expect(res.body[0]).to.have.property('age')
                        expect(res.body[0]).to.have.property('gender')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution_id')
                        expect(res.body[1]).to.have.property('age')
                        expect(res.body[1]).to.have.property('gender')
                        expect(res.body[2]).to.have.property('id')
                        expect(res.body[2]).to.have.property('username')
                        expect(res.body[2]).to.have.property('institution_id')
                        expect(res.body[2]).to.have.property('age')
                        expect(res.body[2]).to.have.property('gender')
                    })
            })
        })
        context('when there are no children in database', () => {
            it('should return status code 200 and a empty array', async () => {
                try {
                    await deleteAllUsers().then()
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }

                return request
                    .get('/v1/children')
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
    return UserRepoModel.deleteMany({})
}

async function createInstitution(item) {
    return await InstitutionRepoModel.create(item)
}

async function deleteAllInstitutions() {
    return InstitutionRepoModel.deleteMany({})
}
