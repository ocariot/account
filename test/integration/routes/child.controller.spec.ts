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

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
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
                            expect(message.child).to.have.property('id')
                            expect(message.child.username).to.eql(defaultChild.username)
                            expect(message.child.gender).to.eql(defaultChild.gender)
                            expect(message.child.age).to.eql(defaultChild.age)
                            expect(message.child.institution_id).to.eql(institution.id)
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
                                age_calc_date: defaultChild.age_calc_date,
                                institution_id: institution.id
                            })
                            .set('Content-Type', 'application/json')
                            .expect(201)
                            .then()
                            .catch(done)
                    })
                    .catch(done)
            })
        })
    })

    describe('POST /v1/children', () => {
        context('when posting a new child user (there is no connection to RabbitMQ)', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
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
                    age_calc_date: defaultChild.age_calc_date,
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
                        expect(res.body.institution_id).to.eql(institution.id)
                        expect(res.body.nfc_tag).to.be.undefined
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        age_calc_date: defaultChild.age_calc_date,
                        institution: new ObjectID(institution.id)
                    })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return status code 409 and message info about duplicate items', () => {
                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    age_calc_date: defaultChild.age_calc_date,
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
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'username, password, institution, gender, ' +
                                'age'))
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
                    age_calc_date: defaultChild.age_calc_date,
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
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the name provided is invalid', () => {
            it('should return status code 400 and message for invalid name', () => {
                const body = {
                    username: '',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql('username must have at least one character!')
                    })
            })
        })

        context('when the password provided is invalid', () => {
            it('should return status code 400 and message for invalid password', () => {
                const body = {
                    username: defaultChild.username,
                    password: '',
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql('password must have at least one character!')
                    })
            })
        })

        context('when the gender provided is invalid', () => {
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
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql('The names of the allowed genders are: male, female.')
                    })
            })
        })

        context('when the age provided is null', () => {
            it('should return status code 400 and an error message about invalid age', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: null,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_STRING
                            .replace('{0}', 'age'))
                    })
            })
        })

        context('when the age provided is empty', () => {
            it('should return status code 400 and message for invalid age', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: '',
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.EMPTY_STRING
                            .replace('{0}', 'age'))
                    })
            })
        })

        context('when the age provided is invalid', () => {
            it('should return status code 400 and message for invalid age', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: `${defaultChild.age}a`,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT
                            .replace('{0}', `${defaultChild.age}a`))
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT_DESC)
                    })
            })
        })

        context('when the age provided is negative', () => {
            it('should return status code 400 and message for invalid age', () => {
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
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(
                            'Age cannot be less than or equal to zero!')
                    })
            })
        })

        context('when the age provided is a number and the \'age_calc_date\' parameter is missing', () => {
            it('should return status code 400 and an error message', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'age_calc_date'))
                    })
            })
        })

        context('when the age provided is an invalid date (invalid format)', () => {
            it('should return status code 400 and an error message about invalid age', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: '2012-06-0',
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT
                            .replace('{0}', '2012-06-0'))
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT_DESC)
                    })
            })
        })

        context('when the age provided is an invalid date (invalid day)', () => {
            it('should return status code 400 and an error message about invalid age', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: '2012-06-35',
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT
                            .replace('{0}', '2012-06-35'))
                    })
            })
        })

        context('when the age provided is an invalid date (future date)', () => {
            it('should return status code 400 and an error message about invalid age', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: '2050-12-31',
                    institution_id: institution.id
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Datetime: 2050-12-31, cannot be used!')
                        expect(err.body.description).to.eql('The \'age\' and \'age_calc_date\' fields can only receive past or present dates.')
                    })
            })
        })

        context('when the age_calc_date provided is null', () => {
            it('should return status code 400 and an error message about invalid age_calc_date', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: institution.id,
                    age_calc_date: null
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_STRING
                            .replace('{0}', 'age_calc_date'))
                    })
            })
        })

        context('when the age_calc_date provided is empty', () => {
            it('should return status code 400 and an error message about invalid age_calc_date', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: institution.id,
                    age_calc_date: ''
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.EMPTY_STRING
                            .replace('{0}', 'age_calc_date'))
                    })
            })
        })

        context('when the age_calc_date provided is invalid', () => {
            it('should return status code 400 and an error message about invalid age_calc_date', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: institution.id,
                    age_calc_date: 1
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_STRING
                            .replace('{0}', 'age_calc_date'))
                    })
            })
        })

        context('when the age_calc_date provided is an invalid date (invalid format)', () => {
            it('should return status code 400 and an error message about invalid age_calc_date', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: institution.id,
                    age_calc_date: '2019-12-0'
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT
                            .replace('{0}', '2019-12-0'))
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT_DESC)
                    })
            })
        })

        context('when the age_calc_date provided is an invalid date (invalid day)', () => {
            it('should return status code 400 and an error message about invalid age_calc_date', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: institution.id,
                    age_calc_date: '2019-12-35'
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT
                            .replace('{0}', '2019-12-35'))
                    })
            })
        })

        context('when the age_calc_date provided is an invalid date (future date)', () => {
            it('should return status code 400 and an error message about invalid age_calc_date', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: institution.id,
                    age_calc_date: '2050-12-31'
                }

                return request
                    .post('/v1/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Datetime: 2050-12-31, cannot be used!')
                        expect(err.body.description).to.eql('The \'age\' and \'age_calc_date\' fields can only receive past or present dates.')
                    })
            })
        })
    })

    describe('GET /v1/children/:child_id', () => {
        context('when get an unique child in database', () => {
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
                        institution: new ObjectID(institution.id)
                    })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return status code 200 and a child', () => {
                return request
                    .get(`/v1/children/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(institution.id)
                    })
            })
        })

        context('when the child is not found', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
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

    describe('RABBITMQ PUBLISHER -> PATCH /v1/children/:child_id', () => {
        context('when this child is updated successfully and published to the bus', () => {
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
                        institution: new ObjectID(institution.id)
                    })

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
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
                            expect(message.child).to.have.property('id')
                            expect(message.child.username).to.eql('new_username')
                            expect(message.child.gender).to.eql(defaultChild.gender)
                            expect(message.child.age).to.eql(defaultChild.age)
                            expect(message.child.institution_id).to.eql(institution.id)
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .patch(`/v1/children/${result.id}`)
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

    describe('PATCH /v1/children/:child_id', () => {
        context('when the update was successful (there is no connection to RabbitMQ)', () => {
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
                        institution: new ObjectID(institution.id)
                    })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return status code 200 and updated child (and show an error log about unable to send ' +
                'UpdateChild event)', () => {
                return request
                    .patch(`/v1/children/${result.id}`)
                    .send({
                        username: 'other_username', last_login: defaultChild.last_login,
                        last_sync: defaultChild.last_sync
                    })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql('other_username')
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body.age).to.eql(defaultChild.age)
                        expect(res.body.institution_id).to.eql(institution.id)
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
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id)
                    })

                    result = await createUser({
                        username: defaultChild.username,
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id)
                    })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return status code 409 and info message from duplicate value', () => {
                return request
                    .patch(`/v1/children/${result.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.ALREADY_REGISTERED)
                    })
            })
        })

        context('when a validation error occurs', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {
                const body = {
                    password: 'mysecretkey'
                }

                return request
                    .patch(`/v1/children/${defaultChild.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('This parameter could not be updated.')
                        expect(err.body.description).to.eql('A specific route to update user password already exists.' +
                            `Access: PATCH /users/${defaultChild.id}/password to update your password.`)
                    })
            })
        })

        context('when the institution provided does not exists', () => {
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
                        institution: new ObjectID(institution.id)
                    })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return status code 400 and message for institution not found', () => {
                return request
                    .patch(`/v1/children/${result.id}`)
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
                        expect(err.body.message).to.eql(Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the child is not found', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
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
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the username is invalid', () => {
            it('should return status code 400 and info message from invalid username', () => {
                return request
                    .patch(`/v1/children/${defaultChild.id}`)
                    .send({ username: '' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql('username must have at least one character!')
                    })
            })
        })

        context('when the gender is invalid', () => {
            it('should return status code 400 and info message from invalid age', () => {
                return request
                    .patch(`/v1/children/${defaultChild.id}`)
                    .send({ gender: 'invalidGender' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql('The names of the allowed genders are: male, female.')
                    })
            })
        })

        context('when the age is negative', () => {
            it('should return status code 400 and info message from invalid age', () => {
                return request
                    .patch(`/v1/children/${defaultChild.id}`)
                    .send({ age: -1 })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql('Age cannot be less than or equal to zero!')
                    })
            })
        })

        context('when the age is invalid', () => {
            it('should return status code 400 and info message from invalid age', () => {
                return request
                    .patch(`/v1/children/${defaultChild.id}`)
                    .send({ age: `${defaultChild.age}a` })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT
                            .replace('{0}', `${defaultChild.age}a`))
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT_DESC)
                    })
            })
        })

        context('when the age provided is a number and the age_calc_date parameter is missing', () => {
            it('should return status code 400 and info message from invalid age', () => {
                return request
                    .patch(`/v1/children/${defaultChild.id}`)
                    .send({ age: 10 })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'age_calc_date'))
                    })
            })
        })

        context('when the age_calc_date is provided and the age parameter is missing', () => {
            it('should return status code 400 and info message from invalid age', () => {
                return request
                    .patch(`/v1/children/${defaultChild.id}`)
                    .send({ age_calc_date: '2010-12-01' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'age'))
                    })
            })
        })

        context('when child_id is the ID of another user type', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()

                    result = await createUser({
                        username: 'ED100TEST',
                        password: '123',
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id)
                    })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })

            it('should return status code 404, with child message does not exist', async () => {
                return request
                    .patch(`/v1/children/${result.id}`)
                    .send({ username: '0001TEST' })
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.CHILD.NOT_FOUND_DESCRIPTION)
                    })
            })
        })
    })

    describe('GET /v1/children', () => {
        context('when want get all children in database', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    await createUser({
                        username: 'BR0002',
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id)
                    })

                    await createUser({
                        username: 'BR0003',
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id)
                    })

                    await createUser({
                        username: 'EU0001',
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id)
                    })

                    await createUser({
                        username: 'BR0001',
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id)
                    })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return status code 200 and a list of children', () => {
                return request
                    .get('/v1/children')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(4)
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

        context('when use query strings', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    await createUser({
                        username: 'BR0002',
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id)
                    })

                    await createUser({
                        username: 'br0003',
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id)
                    })

                    await createUser({
                        username: 'EU0001',
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id)
                    })

                    await createUser({
                        username: 'BR0001',
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id)
                    })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return the result as required in query (query a maximum of three children who have a certain ' +
                'string at the beginning of their username)', () => {
                const url = '/v1/children?username=EU*&sort=username&page=1&limit=3'
                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].username).to.eql('EU0001')
                        expect(res.body[0].institution_id).to.eql(institution.id)
                        expect(res.body[0].gender).to.eql(defaultChild.gender)
                        expect(res.body[0].age).to.eql(defaultChild.age)
                    })
            })

            it('should return the result as required in query (query a maximum of three children who have a certain ' +
                'string at the end of their username)', () => {
                const url = '/v1/children?username=*2&sort=username&page=1&limit=3'
                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].username).to.eql('BR0002')
                        expect(res.body[0].institution_id).to.eql(institution.id)
                        expect(res.body[0].gender).to.eql(defaultChild.gender)
                        expect(res.body[0].age).to.eql(defaultChild.age)
                    })
            })

            it('should return the result as required in query (query a maximum of two children who have a particular ' +
                'string anywhere in their username, sorted in descending order by this username)', () => {
                const url = '/v1/children?username=*BR*&sort=-username&page=1&limit=2'
                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(2)
                        // Tests if the ordination was applied correctly
                        expect(res.body[0].username).to.eql('br0003')
                        expect(res.body[1].username).to.eql('BR0002')
                        for (const child of res.body) {
                            expect(child).to.have.property('id')
                            expect(child).to.have.property('username')
                            expect(child).to.have.property('institution_id')
                            expect(child).to.have.property('gender')
                            expect(child).to.have.property('age')
                        }
                    })
            })

            it('should return the result as required in query (query the child that has username exactly the same as the ' +
                'given string)', () => {
                const url = '/v1/children?username=br0003&sort=username&page=1&limit=2'
                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].username).to.eql('br0003')
                        expect(res.body[0].institution_id).to.eql(institution.id)
                        expect(res.body[0].gender).to.eql(defaultChild.gender)
                        expect(res.body[0].age).to.eql(defaultChild.age)
                    })
            })

            it('should return an empty array (when not find any child)', () => {
                const url = '/v1/children?username=*PB*&sort=username&page=1&limit=3'
                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        context('when get all children ordered by username', () => {
            const childrenSaved: any = []

            before(async () => {
                try {
                    await deleteAllUsers()

                    for (let i = 0; i < 1000; i++) {
                        let childUsername
                        if (i < 10) childUsername = 'BR00'.concat(`${i}`)
                        else if (i >= 10 && i < 100) childUsername = 'BR0'.concat(`${i}`)
                        else childUsername = 'BR'.concat(`${i}`)
                        await createUser({
                            username: childUsername,
                            password: defaultChild.password,
                            type: UserType.CHILD,
                            gender: defaultChild.gender,
                            age: Math.random(),
                            institution: new ObjectID(institution.id)
                        })
                        childrenSaved.push(childUsername)
                    }
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return the result as required in query (query a maximum of 100 children per page ' +
                '(in this case 10 pages) sorted in ascending order by username)', (done) => {
                const limit = 10
                for (let page = 1; page <= limit; page++) {
                    let i = (100 * page) - 100
                    const url = `/v1/children?sort=username,age&page=${page}&limit=100`
                    request
                        .get(url)
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            for (const child of res.body) {
                                expect(child.username).to.eql(childrenSaved[i++])
                            }
                            if (page === limit) done()
                        })
                        .catch(done)
                }
            })

            it('should return the result as required in query (query a maximum of 100 children per page ' +
                '(in this case 10 pages) sorted in descending order by username)', (done) => {
                const newChildrenSaved = childrenSaved.slice()
                newChildrenSaved.reverse()
                const limit = 10
                for (let page = 1; page <= limit; page++) {
                    let i = (100 * page) - 100
                    const url = `/v1/children?sort=-username,age&page=${page}&limit=100`
                    request
                        .get(url)
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            for (const child of res.body) {
                                expect(child.username).to.eql(newChildrenSaved[i++])
                            }
                            if (page === limit) done()
                        })
                        .catch(done)
                }
            })
        })

        context('when get all children ordered by age', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    for (let i = 0; i < 300; i++) {
                        let ageToBeSaved = 9
                        if (i > 99) ageToBeSaved = 10
                        if (i > 199) ageToBeSaved = 11
                        await createUser({
                            username: 'BR'.concat(`${i}`),
                            password: defaultChild.password,
                            type: UserType.CHILD,
                            gender: defaultChild.gender,
                            age: ageToBeSaved,
                            institution: new ObjectID(institution.id)
                        })
                    }
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return the result as required in query (query a maximum of 100 children per page ' +
                '(in this case 3 pages) sorted in ascending order by age)', (done) => {
                const limit = 3
                for (let page = 1; page <= limit; page++) {
                    let age = '9'
                    if (page === 2) age = '10'
                    if (page === 3) age = '11'
                    const url = `/v1/children?sort=age&page=${page}&limit=100`
                    request
                        .get(url)
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            for (const child of res.body) {
                                expect(child.age).to.eql(age)
                            }
                            if (page === limit) done()
                        })
                        .catch(done)
                }
            })

            it('should return the result as required in query (query a maximum of 100 children per page ' +
                '(in this case 3 pages) sorted in descending order by age)', (done) => {
                const limit = 3
                for (let page = 1; page <= limit; page++) {
                    let age = '11'
                    if (page === 2) age = '10'
                    if (page === 3) age = '9'
                    const url = `/v1/children?sort=-age&page=${page}&limit=100`
                    request
                        .get(url)
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .then(res => {
                            for (const child of res.body) {
                                expect(child.age).to.eql(age)
                            }
                            if (page === limit) done()
                        })
                        .catch(done)
                }
            })
        })

        context('when there are no children in the database', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })
            it('should return status code 200 and an empty array', () => {
                return request
                    .get('/v1/children')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })
    })

    describe('POST /v1/children/nfc', () => {
        context('when the successful', () => {
            let resultExpected: any

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultExpected = await createUser({
                        username: 'BR001',
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id)
                    })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })

            it('should return the child when associating NFC Tag successfully', () => {
                const req = () => {
                    request
                        .post(`/v1/children/${resultExpected._id}/nfc`)
                        .send({ nfc_tag: 'a4a22422dd6482' })
                        .set('Content-Type', 'application/json')
                        .expect(201)
                        .then(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body.username).to.eql('BR001')
                            expect(res.body.gender).to.eql(resultExpected.gender)
                            expect(res.body.age).to.eql(resultExpected.age)
                            expect(res.body.nfc_tag).to.eql('a4a22422dd6482')
                        })
                }
                req() // save
                req() // just returns because it has already been saved
            })


            it('should return the child with the updated NFC tag', () => {
                return request
                    .post(`/v1/children/${resultExpected._id}/nfc`)
                    .send({ nfc_tag: 'f719c76b' })
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql('BR001')
                        expect(res.body.gender).to.eql(resultExpected.gender)
                        expect(res.body.age).to.eql(resultExpected.age)
                        expect(res.body.nfc_tag).to.eql('f719c76b')
                    })
            })
        })

        context('when the unsuccessful', () => {
            let resultExpected: any

            before(async () => {
                try {
                    await deleteAllUsers()

                    await createUser({
                        ...new ChildMock().toJSON(),
                        ...{ password: '123', nfc_tag: '1fa90487dd634h' }
                    })
                    resultExpected = await createUser({
                        ...new ChildMock().toJSON(),
                        ...{ password: '123', nfc_tag: '1fa90487dd634h' }
                    })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })

            it('should return ValidationException for invalid child_id', () => {
                return request
                    .post(`/v1/children/04a22422dd6480/nfc`)
                    .send({ nfc_tag: 'f719c76b' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(res => {
                        expect(res.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(res.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })

            it('should return NotFoundException for child not exist', () => {
                return request
                    .post(`/v1/children/5f5654f2ac46451f078f65f0/nfc`)
                    .send({ nfc_tag: '04a22422dd6480' })
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(res => {
                        expect(res.body.message).to.eql(Strings.CHILD.NOT_FOUND)
                        expect(res.body.description).to.eql(Strings.CHILD.NOT_FOUND_DESCRIPTION)
                    })
            })

            it('should return ConflictException for NFC Tag is exist', async () => {
                await request
                    .post(`/v1/children/${resultExpected._id}/nfc`)
                    .send({ nfc_tag: '1fa90487dd634h' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(res => {
                        expect(res.body.message).to.eql(Strings.CHILD.NFC_TAG_ALREADY_REGISTERED)
                        expect(res.body.description).to.eql(Strings.CHILD.NFC_TAG_ALREADY_REGISTERED_DESC)
                    })
            })
        })
    })

    describe('GET /v1/children/nfc/{nfc_tag}', () => {
        context('when the request is successful', () => {
            let resultExpected: any

            before(async () => {
                try {
                    await deleteAllUsers()
                    resultExpected = await createUser({
                        username: 'BR001',
                        password: defaultChild.password,
                        type: UserType.CHILD,
                        gender: defaultChild.gender,
                        age: defaultChild.age,
                        institution: new ObjectID(institution.id),
                        nfc_tag: '04a22422dd6480'
                    })
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })

            it('should return status code 200 and a child', () => {
                return request
                    .get(`/v1/children/nfc/04a22422dd6480`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql('BR001')
                        expect(res.body.gender).to.eql(resultExpected.gender)
                        expect(res.body.age).to.eql(resultExpected.age)
                        expect(res.body.nfc_tag).to.eql(resultExpected.nfc_tag)
                    })
            })
        })

        context('when the request is an error', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Child test: ' + err.message)
                }
            })

            it('should return status code 404 and info message from child not found', () => {
                return request
                    .get(`/v1/children/nfc/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.CHILD.NOT_FOUND_DESCRIPTION)
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
