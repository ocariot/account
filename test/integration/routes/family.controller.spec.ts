import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { Family } from '../../../src/application/domain/model/family'
import { expect } from 'chai'
import { ObjectID } from 'bson'
import { Institution } from '../../../src/application/domain/model/institution'
import { UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { FamilyMock } from '../../mocks/family.mock'
import { InstitutionMock } from '../../mocks/institution.mock'
import { ChildMock } from '../../mocks/child.mock'
import { Strings } from '../../../src/utils/strings'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { Default } from '../../../src/utils/default'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Family', () => {
    const institution: Institution = new InstitutionMock()

    const defaultFamily: Family = new FamilyMock()
    defaultFamily.password = 'family_password'
    defaultFamily.institution = institution

    const defaultChild = new ChildMock()
    defaultChild.institution = institution

    const otherChild = new ChildMock()

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
                throw new Error('Failure on Family test: ' + err.message)
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
            throw new Error('Failure on Family test: ' + err.message)
        }
    })

    describe('POST /v1/families', () => {
        context('when posting a new family user', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()

                    result = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 201 and the saved family', () => {
                const body = {
                    username: defaultFamily.username,
                    password: defaultFamily.password,
                    children: [result.id],
                    institution_id: institution.id
                }

                return request
                    .post('/v1/families')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution_id).to.eql(institution.id)
                        expect(res.body.children.length).is.eql(1)
                        for (const child of res.body.children) {
                            expect(child).to.have.property('id')
                            expect(child.username).to.eql(defaultChild.username)
                            expect(child.gender).to.eql(defaultChild.gender)
                            expect(child.age).to.eql(defaultChild.age)
                            expect(child.institution_id).to.eql(institution.id)
                        }
                    })
            })
        })
        context('when posting a new family user with unregistered children', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the unregistered children', () => {
                const body = {
                    username: defaultFamily.username,
                    password: defaultFamily.password,
                    children: [otherChild],
                    institution_id: institution.id
                }

                return request
                    .post('/v1/families')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        expect(err.body.description).to.eql(Strings.CHILD.IDS_WITHOUT_REGISTER.concat(' ').concat(otherChild.id))
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            let resultChild

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    await createUser({
                        username: defaultFamily.username,
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 409 and message info about duplicate items', () => {
                const body = {
                    username: defaultFamily.username,
                    password: defaultFamily.password,
                    children: [resultChild.id],
                    institution_id: institution.id
                }

                return request
                    .post('/v1/families')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.FAMILY.ALREADY_REGISTERED)
                    })
            })
        })

        context('when a validation error occurs', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {
                const body = {}

                return request
                    .post('/v1/families')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Family validation: username, password, institution, ' +
                            'Collection with children IDs is required!')
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            let resultChild

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 400 and message for institution not found', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultFamily.password,
                    children: [resultChild.id],
                    institution_id: new ObjectID()
                }

                return request
                    .post('/v1/families')
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
                    password: defaultFamily.password,
                    children: [defaultChild.id],
                    institution_id: '123'
                }

                return request
                    .post('/v1/families')
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

    describe('GET /v1/families/:family_id', () => {
        context('when get an unique family in database', () => {
            let resultChild
            let resultFamily

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultFamily = await createUser({
                        username: defaultFamily.username,
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 200 and a family', () => {
                return request
                    .get(`/v1/families/${resultFamily.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution_id).to.eql(institution.id)
                        expect(res.body.children.length).is.eql(1)
                        for (const child of res.body.children) {
                            expect(child).to.have.property('id')
                            expect(child.username).to.eql(defaultChild.username)
                            expect(child.institution_id).to.eql(institution.id)
                            expect(child.gender).to.eql(defaultChild.gender)
                            expect(child.age).to.eql(defaultChild.age)
                        }
                    })
            })
        })

        context('when the family is not found', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 404 and info message from family not found', () => {
                return request
                    .get(`/v1/families/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.FAMILY.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.FAMILY.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the family_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {
                return request
                    .get('/v1/families/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.FAMILY.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('RABBITMQ PUBLISHER -> PATCH /v1/families/:family_id', () => {
        context('when this family is updated successfully and published to the bus', () => {
            let resultChild
            let resultFamily

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultFamily = await createUser({
                        username: defaultFamily.username,
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id),
                        scopes: new Array('users:read')
                    })

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and with the same values as the family ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subUpdateFamily(message => {
                        try {
                            expect(message.event_name).to.eql('FamilyUpdateEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('family')
                            expect(message.family).to.have.property('id')
                            expect(message.family.username).to.eql('new_username')
                            expect(message.family.institution_id).to.eql(institution.id)
                            expect(message.family.children.length).is.eql(1)
                            for (const child of message.family.children) {
                                expect(child).to.have.property('id')
                                expect(child.username).to.eql(defaultChild.username)
                                expect(child.institution_id).to.eql(institution.id)
                                expect(child.gender).to.eql(defaultChild.gender)
                                expect(child.age).to.eql(defaultChild.age)
                            }
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .patch(`/v1/families/${resultFamily.id}`)
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

    describe('PATCH /v1/families/:family_id', () => {
        context('when the update was successful (and there is no connection to RabbitMQ)', () => {
            let resultChild
            let resultFamily

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultFamily = await createUser({
                        username: defaultFamily.username,
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 200 and updated family (and show an error log about unable to send ' +
                'UpdateFamily event)', () => {
                    return request
                        .patch(`/v1/families/${resultFamily.id}`)
                        .send({ username: 'new_username', last_login: defaultFamily.last_login })
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body.username).to.eql('new_username')
                            expect(res.body.institution_id).to.eql(institution.id)
                            expect(res.body.children.length).is.eql(1)
                            for (const child of res.body.children) {
                                expect(child).to.have.property('id')
                                expect(child.username).to.eql(defaultChild.username)
                                expect(child.institution_id).to.eql(institution.id)
                                expect(child.gender).to.eql(defaultChild.gender)
                                expect(child.age).to.eql(defaultChild.age)
                            }
                        })
                })
        })

        context('when a duplication error occurs', () => {
            let resultChild
            let resultFamily

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    await createUser({
                        username: 'acoolusername',
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id),
                        scopes: new Array('users:read')
                    })

                    resultFamily = await createUser({
                        username: defaultFamily.username,
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 409 and info message from duplicate value', async () => {
                return request
                    .patch(`/v1/families/${resultFamily.id}`)
                    .send({ username: 'acoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql('Family is already registered!')
                    })
            })
        })

        context('when a validation error occurs', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {
                const body = {
                    password: 'mysecretkey'
                }

                return request
                    .patch(`/v1/families/${defaultFamily.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('This parameter could not be updated.')
                        expect(err.body.description).to.eql('A specific route to update user password already exists.' +
                            `Access: PATCH /users/${defaultFamily.id}/password to update your password.`)
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {
                return request
                    .patch(`/v1/families/${defaultFamily.id}`)
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
            it(' should return status code 400 and message for invalid institution id', () => {
                return request
                    .patch(`/v1/families/${defaultFamily.id}`)
                    .send({ institution_id: '123' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the family is not found', () => {
            it('should return status code 404 and info message from family not found', () => {
                return request
                    .patch(`/v1/families/${new ObjectID()}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.FAMILY.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.FAMILY.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the family_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch('/v1/families/123')
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

    describe('POST /v1/families/:family_id/children/:child_id', () => {
        context('when want associate a child with a family', () => {
            let resultChild
            let resultChild2
            let resultFamily

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChild2 = await createUser({
                        username: 'ihaveauniqueusername',
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultFamily = await createUser({
                        username: defaultFamily.username,
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 200 and a family', async () => {
                return request
                    .post(`/v1/families/${resultFamily.id}/children/${resultChild2.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution_id).to.eql(institution.id)
                        expect(res.body.children.length).is.eql(2)
                        for (const child of res.body.children) {
                            expect(child).to.have.property('id')
                            expect(child).to.have.property('username')
                            expect(child.institution_id).to.eql(institution.id)
                            expect(child.gender).to.eql(defaultChild.gender)
                            expect(child.age).to.eql(defaultChild.age)
                        }
                    })
            })
        })

        context('when the child id does not exists', () => {
            let resultChild
            let resultFamily

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultFamily = await createUser({
                        username: defaultFamily.username,
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 400 and info message from invalid child ID', () => {
                return request
                    .post(`/v1/families/${resultFamily.id}/children/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.ASSOCIATION_FAILURE)
                    })
            })
        })

        context('when the child id is invalid', () => {
            it('should return status code 400 and info message from invalid child ID', () => {
                return request
                    .post(`/v1/families/${defaultFamily.id}/children/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('DELETE /v1/families/:family_id/children/:child_id', () => {
        context('when want disassociate a child from a family', () => {
            let resultChild
            let resultFamily

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultFamily = await createUser({
                        username: defaultFamily.username,
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 204 and no content', () => {
                return request
                    .delete(`/v1/families/${resultFamily.id}/children/${resultChild.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the child id does not exists', () => {
            let resultChild
            let resultFamily

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultFamily = await createUser({
                        username: defaultFamily.username,
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 204 and no content, even the child id does not exists', () => {
                return request
                    .delete(`/v1/families/${resultFamily.id}/children/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the child id is invalid', () => {
            it('should return status code 400 and info message about invalid child id', () => {
                return request
                    .delete(`/v1/families/${defaultFamily.id}/children/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('GET /v1/families/:family_id/children', () => {
        context('when want get all children from family', () => {
            let resultChild
            let resultChild2
            let resultFamily

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChild2 = await createUser({
                        username: 'ihaveauniqueusername',
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultFamily = await createUser({
                        username: defaultFamily.username,
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id, resultChild2.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 200 and the family children', () => {
                return request
                    .get(`/v1/families/${resultFamily.id}/children`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).is.eql(2)
                        for (const child of res.body) {
                            expect(child).to.have.property('id')
                            expect(child).to.have.property('username')
                            expect(child).to.have.property('institution_id')
                            expect(child).to.have.property('gender')
                            expect(child).to.have.property('age')
                        }
                    })
            })
        })

        context('when there no are children associated with a family', () => {
            let resultFamily

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultFamily = await createUser({
                        username: defaultFamily.username,
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 200 and empty array', async () => {
                return request
                    .get(`/v1/families/${resultFamily.id}/children`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).is.eql(0)
                    })

            })
        })

        context('when family id does not exists', () => {
            it('should return status code 404 and info message from family not found', () => {
                return request
                    .get(`/v1/families/${new ObjectID()}/children`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.FAMILY.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.FAMILY.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when family id is invalid', () => {
            it('should return status code 400 and info message invalid family id', () => {
                return request
                    .get('/v1/families/123/children')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.FAMILY.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('GET /v1/families', () => {
        context('when want get all families in database', () => {
            let resultChild

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    await createUser({
                        username: defaultFamily.username,
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id),
                        scopes: new Array('users:read')
                    })

                    await createUser({
                        username: 'other_family',
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return status code 200 and a list of users', () => {
                return request
                    .get('/v1/families')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(2)
                        for (const family of res.body) {
                            expect(family).to.have.property('id')
                            expect(family).to.have.property('username')
                            expect(family).to.have.property('institution_id')
                            expect(family).to.have.property('children')
                            for (const child of family.children) {
                                expect(child).to.have.property('id')
                                expect(child).to.have.property('username')
                                expect(child).to.have.property('institution_id')
                                expect(child).to.have.property('gender')
                                expect(child).to.have.property('age')
                            }
                        }
                    })
            })
        })

        context('when use query strings', () => {
            let resultChild

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    await createUser({
                        username: defaultFamily.username,
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id),
                        scopes: new Array('users:read')
                    })

                    await createUser({
                        username: 'myusernameisunique',
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: new ObjectID(institution.id),
                        children: new Array<string | undefined>(resultChild.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })
            it('should return the result as required in query', async () => {
                const url: string = '/v1/families?username=myusernameisunique&sort=username&page=1&limit=3'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(1)
                        for (const family of res.body) {
                            expect(family).to.have.property('id')
                            expect(family.username).to.eql('myusernameisunique')
                            expect(family.institution_id).to.eql(institution.id)
                            expect(family.children.length).to.eql(1)
                            for (const child of family.children) {
                                expect(child).to.have.property('id')
                                expect(child.username).to.eql(defaultChild.username)
                                expect(child.institution_id).to.eql(institution.id)
                                expect(child.gender).to.eql(defaultChild.gender)
                                expect(child.age).to.eql(defaultChild.age)
                            }
                        }
                    })
            })
        })

        context('when there are no families in database', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }
            })

            it('should return status code 200 and an empty array', async () => {
                return request
                    .get('/v1/families')
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
    return await UserRepoModel.create(item)
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
