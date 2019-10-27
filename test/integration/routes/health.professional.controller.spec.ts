import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { HealthProfessional } from '../../../src/application/domain/model/health.professional'
import { expect } from 'chai'
import { ObjectID } from 'bson'
import { Institution } from '../../../src/application/domain/model/institution'
import { UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { ChildrenGroupRepoModel } from '../../../src/infrastructure/database/schema/children.group.schema'
import { Child } from '../../../src/application/domain/model/child'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { InstitutionMock } from '../../mocks/institution.mock'
import { HealthProfessionalMock } from '../../mocks/health.professional.mock'
import { Strings } from '../../../src/utils/strings'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { Default } from '../../../src/utils/default'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { ChildMock } from '../../mocks/child.mock'
import { ChildrenGroupMock } from '../../mocks/children.group.mock'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: HealthProfessional', () => {
    const institution: Institution = new InstitutionMock()

    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    defaultHealthProfessional.institution = institution

    const defaultChild: Child = new ChildMock()
    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroupMock()

    before(async () => {
            try {
                await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                    { interval: 100 })

                await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })

                await deleteAllUsers()
                await deleteAllInstitutions()
                await deleteAllChildrenGroups()

                const item = await createInstitution({
                    type: 'Any Type',
                    name: 'Name Example',
                    address: '221B Baker Street, St.',
                    latitude: 0,
                    longitude: 0
                })
                institution.id = item._id.toString()
            } catch (err) {
                throw new Error('Failure on HealthProfessional test: ' + err.message)
            }
        }
    )

    after(async () => {
        try {
            await deleteAllUsers()
            await deleteAllInstitutions()
            await deleteAllChildrenGroups()
            await dbConnection.dispose()
            await rabbitmq.dispose()
        } catch (err) {
            throw new Error('Failure on HealthProfessional test: ' + err.message)
        }
    })

    describe('POST /v1/healthprofessionals', () => {
        context('when posting a new health professional user', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 201 and the saved health professional', () => {
                const body = {
                    username: defaultHealthProfessional.username,
                    password: defaultHealthProfessional.password,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/healthprofessionals')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultHealthProfessional.username)
                        expect(res.body.institution_id).to.eql(institution.id)
                        expect(res.body.children_groups.length).to.eql(0)
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 409 and message info about duplicate items', () => {
                const body = {
                    username: defaultHealthProfessional.username,
                    password: defaultHealthProfessional.password,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/healthprofessionals')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.HEALTH_PROFESSIONAL.ALREADY_REGISTERED)
                    })
            })
        })

        context('when a validation error occurs', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {
                const body = {
                }

                return request
                    .post('/v1/healthprofessionals')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql('username, password, institution'
                            .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultHealthProfessional.password,
                    institution_id: new ObjectID()
                }

                return request
                    .post('/v1/healthprofessionals')
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
                    password: defaultHealthProfessional.password,
                    institution_id: '123'
                }

                return request
                    .post('/v1/children')
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

    describe('GET /v1/healthprofessionals/:healthprofessional_id', () => {
        context('when get an unique health professional in database', () => {
            let resultHealthProfessional
            let resultChild
            let resultChildrenGroup

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChildrenGroup = await createChildrenGroup({
                        name: defaultChildrenGroup.name,
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })

                    await updateUser({
                        id: resultHealthProfessional.id,
                        children_groups: [resultChildrenGroup.id]
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 200 and a health professional', () => {
                return request
                    .get(`/v1/healthprofessionals/${resultHealthProfessional.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultHealthProfessional.username)
                        expect(res.body.institution_id).to.eql(institution.id)
                        expect(res.body.children_groups.length).to.eql(1)
                        for (const childrenGroup of res.body.children_groups) {
                            expect(childrenGroup).to.have.property('id')
                            expect(childrenGroup.name).to.eql(defaultChildrenGroup.name)
                            expect(childrenGroup.children.length).to.eql(1)
                            for (const child of childrenGroup.children) {
                                expect(child).to.have.property('id')
                                expect(child.username).to.eql(defaultChild.username)
                                expect(child.institution_id).to.eql(institution.id)
                                expect(child.gender).to.eql(defaultChild.gender)
                                expect(child.age).to.eql(defaultChild.age)
                            }
                            expect(childrenGroup.school_class).to.eql(defaultChildrenGroup.school_class)
                        }
                    })
            })
        })

        context('when the health professional is not found', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 404 and info message from health professional not found', () => {
                return request
                    .get(`/v1/healthprofessionals/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.HEALTH_PROFESSIONAL.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.HEALTH_PROFESSIONAL.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the healthprofessional_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {
                return request
                    .get('/v1/healthprofessionals/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.HEALTH_PROFESSIONAL.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('RABBITMQ PUBLISHER -> PATCH /v1/healthprofessionals/:healthprofessional_id', () => {
        context('when this health professional is updated successfully and published to the bus', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()

                    result = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and with the same values as the health professional ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subUpdateHealthProfessional(message => {
                        try {
                            expect(message.event_name).to.eql('HealthProfessionalUpdateEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('healthprofessional')
                            expect(message.healthprofessional).to.have.property('id')
                            expect(message.healthprofessional.username).to.eql('new_username')
                            expect(message.healthprofessional.institution_id).to.eql(institution.id)
                            expect(message.healthprofessional.children_groups.length).to.eql(0)
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .patch(`/v1/healthprofessionals/${result.id}`)
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

    describe('PATCH /v1/healthprofessionals/:healthprofessional_id', () => {
        context('when the update was successful (there is no connection to RabbitMQ)', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()

                    result = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 200 and updated health professional (and show an error log about unable to send ' +
                'UpdateHealthProfessional event)', () => {
                return request
                    .patch(`/v1/healthprofessionals/${result.id}`)
                    .send({ username: 'other_username', last_login: defaultHealthProfessional.last_login })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql('other_username')
                        expect(res.body.institution_id).to.eql(institution.id)
                        expect(res.body.children_groups.length).to.eql(0)
                    })
            })
        })

        context('when a duplication error occurs', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()

                    await createUser({
                        username: 'anothercoolusername',
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    result = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 409 and info message from duplicate value', () => {
                return request
                    .patch(`/v1/healthprofessionals/${result.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.HEALTH_PROFESSIONAL.ALREADY_REGISTERED)
                    })
            })
        })

        context('when a validation error occurs', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {
                const body = {
                    password: 'mysecretkey'
                }

                return request
                    .patch(`/v1/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('This parameter could not be updated.')
                        expect(err.body.description).to.eql('A specific route to update user password already exists.' +
                            `Access: PATCH /users/${defaultHealthProfessional.id}/password to update your password.`)
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {
                return request
                    .patch(`/v1/healthprofessionals/${defaultHealthProfessional.id}`)
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
                    .patch(`/v1/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ institution_id: '123' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the health professional is not found', () => {
            it('should return status code 404 and info message from health professional not found', () => {
                return request
                    .patch(`/v1/healthprofessionals/${new ObjectID()}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.HEALTH_PROFESSIONAL.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.HEALTH_PROFESSIONAL.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the healthprofessional_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch('/v1/healthprofessionals/123')
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.HEALTH_PROFESSIONAL.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('POST /v1/healthprofessionals/:healthprofessional_id/children/groups', () => {
        context('when posting a new children group', () => {
            let resultHealthProfessional
            let resultChild

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 201 and a children group', () => {
                const body = {
                    name: defaultChildrenGroup.name,
                    children: new Array<string | undefined>(resultChild.id),
                    school_class: defaultChildrenGroup.school_class
                }

                return request
                    .post(`/v1/healthprofessionals/${resultHealthProfessional.id}/children/groups`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body.children.length).to.eql(1)
                        for (const child of res.body.children) {
                            expect(child).to.have.property('id')
                            expect(child.username).to.eql(defaultChild.username)
                            expect(child.institution_id).to.eql(institution.id)
                            expect(child.gender).to.eql(defaultChild.gender)
                            expect(child.age).to.eql(defaultChild.age)
                        }
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            let resultHealthProfessional
            let resultChild

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    await createChildrenGroup({
                        name: defaultChildrenGroup.name,
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 409 and info message about duplicate items', () => {
                const body = {
                    name: defaultChildrenGroup.name,
                    children: new Array<string | undefined>(resultChild.id),
                    school_class: defaultChildrenGroup.school_class
                }

                return request
                    .post(`/v1/healthprofessionals/${resultHealthProfessional.id}/children/groups`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILDREN_GROUP.ALREADY_REGISTERED)
                    })
            })
        })

        context('when there are validation errors', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    result = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 400 and info message from invalid or missing parameters', () => {
                return request
                    .post(`/v1/healthprofessionals/${result.id}/children/groups`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql('name, Collection with children IDs'
                            .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                    })
            })
        })

        context('when the children id(ids) is (are) invalid', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    result = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 400 and info message from invalid IDs', () => {
                const body = {
                    name: 'Children Group One',
                    children: new Array<string | undefined>('123', '123a'),
                    school_class: '3th Grade'
                }

                return request
                    .post(`/v1/healthprofessionals/${result.id}/children/groups`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql('The following IDs from children attribute are not ' +
                            'in valid format: 123, 123a')
                    })
            })
        })

        context('when the children id(ids) does not exists in database', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    result = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 400 and info message from invalid IDs', () => {
                const body = {
                    name: 'Children Group Two',
                    children: new Array<string | undefined>('507f1f77bcf86cd799439011'),
                    school_class: '3th Grade'
                }

                return request
                    .post(`/v1/healthprofessionals/${result.id}/children/groups`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        expect(err.body.description).to.eql(Strings.CHILD.IDS_WITHOUT_REGISTER
                            .concat('507f1f77bcf86cd799439011'))
                    })
            })
        })
    })

    describe('GET /v1/healthprofessionals/:healthprofessional_id/children/groups/:group_id', () => {
        context('when want get an unique children group', () => {
            let resultHealthProfessional
            let resultChild
            let resultChildrenGroup

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChildrenGroup = await createChildrenGroup({
                        name: defaultChildrenGroup.name,
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })

                    await updateUser({
                        id: resultHealthProfessional.id,
                        children_groups: new Array(resultChildrenGroup.id)
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 200 and a children group', () => {
                const url = `/v1/healthprofessionals/${resultHealthProfessional.id}/`
                    .concat(`children/groups/${resultChildrenGroup.id}`)

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body.children.length).to.eql(1)
                        for (const child of res.body.children) {
                            expect(child).to.have.property('id')
                            expect(child.username).to.eql(defaultChild.username)
                            expect(child.institution_id).to.eql(institution.id)
                            expect(child.gender).to.eql(defaultChild.gender)
                            expect(child.age).to.eql(defaultChild.age)
                        }
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })
        })

        context('when the children group is not found', () => {
            let resultHealthProfessional

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 404 and info message from children group not found', () => {
                const url = `/v1/healthprofessionals/${resultHealthProfessional.id}/`
                    .concat(`children/groups/${new ObjectID()}`)
                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILDREN_GROUP.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.CHILDREN_GROUP.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the children group_id is invalid', () => {
            it('should return status code 400 and info message from invalid ID', () => {
                return request
                    .get(`/v1/healthprofessionals/${defaultHealthProfessional.id}/children/groups/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILDREN_GROUP.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('PATCH /v1/healthprofessionals/:healthprofessional_id/children/groups/:group_id', () => {
        context('when the update was successful', () => {
            let resultHealthProfessional
            let resultChild
            let resultChildrenGroup

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChildrenGroup = await createChildrenGroup({
                        name: defaultChildrenGroup.name,
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 200 and an updated children group', () => {
                const url = `/v1/healthprofessionals/${resultHealthProfessional.id}/`
                    .concat(`children/groups/${resultChildrenGroup.id}`)

                return request
                    .patch(url)
                    .send({ school_class: '5th Grade' })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body.children.length).to.eql(1)
                        for (const child of res.body.children) {
                            expect(child).to.have.property('id')
                            expect(child.username).to.eql(defaultChild.username)
                            expect(child.institution_id).to.eql(institution.id)
                            expect(child.gender).to.eql(defaultChild.gender)
                            expect(child.age).to.eql(defaultChild.age)
                        }
                        expect(res.body.school_class).to.eql('5th Grade')
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            let resultHealthProfessional
            let resultChild
            let resultChildrenGroup

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChildrenGroup = await createChildrenGroup({
                        name: defaultChildrenGroup.name,
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })

                    await createChildrenGroup({
                        name: 'anothercoolname',
                        children: new Array<string | undefined>(defaultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 409 and info message from duplicate items', () => {
                const url = `/v1/healthprofessionals/${resultHealthProfessional.id}/`
                    .concat(`children/groups/${resultChildrenGroup.id}`)

                return request
                    .patch(url)
                    .send({ name: 'anothercoolname' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILDREN_GROUP.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the children group was updated with a not existent child id', () => {
            let resultHealthProfessional
            let resultChild
            let resultChildrenGroup

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChildrenGroup = await createChildrenGroup({
                        name: defaultChildrenGroup.name,
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 400 and info message for invalid child id', () => {
                const url = `/v1/healthprofessionals/${resultHealthProfessional.id}/`
                    .concat(`children/groups/${resultChildrenGroup.id}`)

                return request
                    .patch(url)
                    .send({ children: new Array<string>('507f1f77bcf86cd799439011') })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        expect(err.body.description).to.eql(Strings.CHILD.IDS_WITHOUT_REGISTER
                            .concat('507f1f77bcf86cd799439011'))
                    })
            })
        })

        context('when the children group was updated with an invalid child id', () => {
            let resultHealthProfessional
            let resultChild
            let resultChildrenGroup

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChildrenGroup = await createChildrenGroup({
                        name: defaultChildrenGroup.name,
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 400 and info message from invalid IDs', () => {
                const url = `/v1/healthprofessionals/${resultHealthProfessional.id}/`
                    .concat(`children/groups/${resultChildrenGroup.id}`)

                return request
                    .patch(url)
                    .send({ children: new Array<string>('123', '123a') })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql('The following IDs from children attribute are not ' +
                            'in valid format: 123, 123a')
                    })
            })
        })
    })

    describe('DELETE /v1/healthprofessionals/:healthprofessional_id/children/groups/:group_id', () => {
        context('when the delete was successful', () => {
            let resultHealthProfessional
            let resultChild
            let resultChildrenGroup

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChildrenGroup = await createChildrenGroup({
                        name: defaultChildrenGroup.name,
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 204 and no content', () => {
                const url = `/v1/healthprofessionals/${resultHealthProfessional.id}/`
                    .concat(`children/groups/${resultChildrenGroup.id}`)

                return request
                    .delete(url)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the children group is not founded', () => {
            let resultHealthProfessional

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 404 and info message for children group not found', () => {
                const url = `/v1/healthprofessionals/${resultHealthProfessional.id}/`
                    .concat(`children/groups/${new ObjectID()}`)

                return request
                    .delete(url)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the children group_id is invalid', () => {
            it('should return status code 400 and info message for invalid children group ID', () => {
                return request
                    .delete(`/v1/healthprofessionals/${defaultHealthProfessional.id}/children/groups/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILDREN_GROUP.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('GET /v1/healthprofessionals/:healthprofessional_id/children/groups', () => {
        context('when want all children groups from healthprofessional', () => {
            let resultHealthProfessional
            let resultChild
            let resultChildrenGroup
            let resultChildrenGroup2

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChildrenGroup = await createChildrenGroup({
                        name: defaultChildrenGroup.name,
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })

                    resultChildrenGroup2 = await createChildrenGroup({
                        name: 'other_children_group_name',
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })

                    await updateUser({
                        id: resultHealthProfessional.id,
                        children_groups: [resultChildrenGroup.id, resultChildrenGroup2.id]
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 200 and a list of children groups', () => {
                return request
                    .get(`/v1/healthprofessionals/${resultHealthProfessional.id}/children/groups`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(2)
                        for (const childrenGroup of res.body) {
                            expect(childrenGroup).to.have.property('id')
                            expect(childrenGroup).to.have.property('name')
                            expect(childrenGroup.children.length).to.eql(1)
                            expect(childrenGroup.children[0]).to.have.property('id')
                            expect(childrenGroup.children[0].username).to.eql(defaultChild.username)
                            expect(childrenGroup.children[0].institution_id).to.eql(institution.id)
                            expect(childrenGroup.children[0].gender).to.eql(defaultChild.gender)
                            expect(childrenGroup.children[0].age).to.eql(defaultChild.age)
                            expect(childrenGroup).to.have.property('school_class')
                        }
                    })
            })
        })

        context('when use query strings', () => {
            let resultHealthProfessional
            let resultChild
            let resultChildrenGroup
            let resultChildrenGroup2

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })

                    resultChild = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChildrenGroup = await createChildrenGroup({
                        name: defaultChildrenGroup.name,
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })

                    resultChildrenGroup2 = await createChildrenGroup({
                        name: 'other_children_group_name',
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })

                    await updateUser({
                        id: resultHealthProfessional.id,
                        children_groups: [resultChildrenGroup.id, resultChildrenGroup2.id]
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return the result as required in query', () => {
                const url = `/v1/healthprofessionals/${resultHealthProfessional.id}/`
                    .concat(`children/groups?name=other_children_group_name&sort=name&page=1&limit=3`)
                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].name).to.eql('other_children_group_name')
                        expect(res.body[0].children.length).to.eql(1)
                        expect(res.body[0].children[0]).to.have.property('id')
                        expect(res.body[0].children[0].username).to.eql(defaultChild.username)
                        expect(res.body[0].children[0].institution_id).to.eql(institution.id)
                        expect(res.body[0].children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body[0].children[0].age).to.eql(defaultChild.age)
                        expect(res.body[0].school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })
        })

        context('when there no are children groups associated with an user', () => {
            let resultHealthProfessional

            before(async () => {
                try {
                    await deleteAllUsers()
                    await deleteAllChildrenGroups()

                    resultHealthProfessional = await createUser({
                        username: defaultHealthProfessional.username,
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 200 and an empty array', () => {
                return request
                    .get(`/v1/healthprofessionals/${resultHealthProfessional.id}/children/groups`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })

            })
        })
    })

    describe('GET /v1/healthprofessionals', () => {
        context('when want get all health professionals in database', () => {
            let resultChild
            let resultHealthProfessional
            let resultHealthProfessional2
            let resultChildrenGroup
            let resultChildrenGroup2

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

                    resultHealthProfessional = await createUser({
                        username: 'HPROFBR0001',
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultHealthProfessional2 = await createUser({
                        username: 'HPROFBR0002',
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChildrenGroup = await createChildrenGroup({
                        name: defaultChildrenGroup.name,
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })

                    resultChildrenGroup2 = await createChildrenGroup({
                        name: 'other_children_group_name',
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional2.id
                    })

                    await updateUser({
                        id: resultHealthProfessional.id,
                        children_groups: [resultChildrenGroup.id]
                    })

                    await updateUser({
                        id: resultHealthProfessional2.id,
                        children_groups: [resultChildrenGroup2.id]
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 200 and a list of health professionals', () => {
                return request
                    .get('/v1/healthprofessionals')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(2)
                        for (const healthProf of res.body) {
                            expect(healthProf).to.have.property('id')
                            expect(healthProf).to.have.property('username')
                            expect(healthProf).to.have.property('institution_id')
                            expect(healthProf).to.have.property('children_groups')
                            for (const childrenGroup of healthProf.children_groups) {
                                expect(childrenGroup).to.have.property('id')
                                expect(childrenGroup).to.have.property('name')
                                expect(childrenGroup).to.have.property('children')
                                for (const child of childrenGroup.children) {
                                    expect(child).to.have.property('id')
                                    expect(child).to.have.property('username')
                                    expect(child).to.have.property('institution_id')
                                    expect(child).to.have.property('gender')
                                    expect(child).to.have.property('age')
                                }
                                expect(childrenGroup).to.have.property('school_class')
                            }
                        }
                    })
            })
        })

        context('when use query strings', () => {
            let resultChild
            let resultHealthProfessional
            let resultHealthProfessional2
            let resultChildrenGroup
            let resultChildrenGroup2

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

                    resultHealthProfessional = await createUser({
                        username: 'HPROFBR0001',
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultHealthProfessional2 = await createUser({
                        username: 'HPROFBR0002',
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    resultChildrenGroup = await createChildrenGroup({
                        name: defaultChildrenGroup.name,
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional.id
                    })

                    resultChildrenGroup2 = await createChildrenGroup({
                        name: 'other_children_group_name',
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultHealthProfessional2.id
                    })

                    await updateUser({
                        id: resultHealthProfessional.id,
                        children_groups: [resultChildrenGroup.id]
                    })

                    await updateUser({
                        id: resultHealthProfessional2.id,
                        children_groups: [resultChildrenGroup2.id]
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return the result as required in query (query the health professional that has username exactly ' +
                'the same as the given string)', () => {
                const url: string = '/v1/healthprofessionals?username=HPROFBR0002&sort=username&page=1&limit=3'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(1)
                        for (const healthProf of res.body) {
                            expect(healthProf).to.have.property('id')
                            expect(healthProf.username).to.eql('HPROFBR0002')
                            expect(healthProf.institution_id).to.eql(institution.id)
                            expect(healthProf.children_groups.length).to.eql(1)
                            for (const childrenGroup of healthProf.children_groups) {
                                expect(childrenGroup).to.have.property('id')
                                expect(childrenGroup.name).to.eql('other_children_group_name')
                                expect(childrenGroup.children.length).to.eql(1)
                                for (const child of childrenGroup.children) {
                                    expect(child).to.have.property('id')
                                    expect(child.username).to.eql(defaultChild.username)
                                    expect(child.institution_id).to.eql(institution.id)
                                    expect(child.gender).to.eql(defaultChild.gender)
                                    expect(child.age).to.eql(defaultChild.age)
                                }
                                expect(childrenGroup.school_class).to.eql(defaultChildrenGroup.school_class)
                            }
                        }
                    })
            })

            it('should return an empty array (when not find any health professional)', () => {
                const url = '/v1/healthprofessionals?username=*PB*&sort=username&page=1&limit=3'
                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        context('when there are no health professionals in the database', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }
            })
            it('should return status code 200 and an empty array', () => {
                return request
                    .get('/v1/healthprofessionals')
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

async function updateUser(item) {
    return UserRepoModel.findOneAndUpdate({ _id: item.id }, item, { new: true })
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

async function createChildrenGroup(item) {
    return ChildrenGroupRepoModel.create(item)
}

async function deleteAllChildrenGroups() {
    return ChildrenGroupRepoModel.deleteMany({})
}
