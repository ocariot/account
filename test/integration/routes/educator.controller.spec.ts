import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { Educator } from '../../../src/application/domain/model/educator'
import { expect } from 'chai'
import { ObjectID } from 'bson'
import { Institution } from '../../../src/application/domain/model/institution'
import { UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { Child } from '../../../src/application/domain/model/child'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { ChildrenGroupRepoModel } from '../../../src/infrastructure/database/schema/children.group.schema'
import { EducatorMock } from '../../mocks/educator.mock'
import { Strings } from '../../../src/utils/strings'
import { InstitutionMock } from '../../mocks/institution.mock'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { Default } from '../../../src/utils/default'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { ChildMock } from '../../mocks/child.mock'
import { ChildrenGroupMock } from '../../mocks/children.group.mock'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Educator', () => {
    const institution: Institution = new InstitutionMock()

    const defaultEducator: Educator = new EducatorMock()
    defaultEducator.password = 'educator_password'
    defaultEducator.institution = institution

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

                const child = await createUser({
                    username: 'anotherusername',
                    password: 'mysecretkey',
                    type: UserType.CHILD,
                    gender: 'male',
                    age: 11,
                    institution: new ObjectID(institution.id),
                    scopes: new Array('users:read')
                }).then()

                defaultChild.id = child.id.toString()

            } catch (err) {
                throw new Error('Failure on Educator test: ' + err.message)
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
            throw new Error('Failure on Educator test: ' + err.message)
        }
    })

    describe('POST /v1/educators', () => {
        context('when posting a new educator user', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 201 and the saved educator', () => {
                const body = {
                    username: defaultEducator.username,
                    password: defaultEducator.password,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/educators')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultEducator.username)
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
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 409 and message info about duplicate items', () => {
                const body = {
                    username: defaultEducator.username,
                    password: defaultEducator.password,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/educators')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.EDUCATOR.ALREADY_REGISTERED)
                    })
            })
        })

        context('when a validation error occurs', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {
                const body = {
                }

                return request
                    .post('/v1/educators')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Educator validation: username, password, institution is required!')
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultEducator.password,
                    institution_id: new ObjectID()
                }

                return request
                    .post('/v1/educators')
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
                    password: defaultEducator.password,
                    institution_id: '123'
                }

                return request
                    .post('/v1/educators')
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

    describe('GET /v1/educators/:educator_id', () => {
        context('when get a unique educator in database', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()

                    result = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 200 and a educator', () => {
                return request
                    .get(`/v1/educators/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultEducator.username)
                        expect(res.body.institution_id).to.eql(institution.id)
                        expect(res.body.children_groups.length).to.eql(0)
                    })
            })
        })

        context('when the educator is not found', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 404 and info message from educator not found', () => {
                return request
                    .get(`/v1/educators/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.EDUCATOR.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.EDUCATOR.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the educator_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {
                return request
                    .get('/v1/educators/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.EDUCATOR.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('NO CONNECTION TO RABBITMQ -> PATCH /v1/educators/:educator_id', () => {
        context('when the update was successful', () => {
            let result

            before(async () => {
                 try {
                     await deleteAllUsers()

                     result = await createUser({
                         username: defaultEducator.username,
                         password: defaultEducator.password,
                         type: UserType.EDUCATOR,
                         institution: new ObjectID(institution.id),
                         scopes: new Array('users:read')
                     })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 200 and updated educator (and show an error log about unable to send ' +
                'UpdateEducator event)', () => {
                return request
                    .patch(`/v1/educators/${result.id}`)
                    .send({ username: 'new_username' })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql('new_username')
                        expect(res.body.institution_id).to.eql(institution.id)
                        expect(res.body.children_groups.length).to.eql(0)
                    })
            })
        })
    })

    describe('RABBITMQ PUBLISHER -> PATCH /v1/educators/:educator_id', () => {
        context('when this educator is updated successfully and published to the bus', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()

                    result = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and with the same values as the educator ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subUpdateEducator(message => {
                        try {
                            expect(message.event_name).to.eql('EducatorUpdateEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('educator')
                            expect(message.educator).to.have.property('id')
                            expect(message.educator.username).to.eql('new_username')
                            expect(message.educator.institution_id).to.eql(institution.id)
                            expect(message.educator.children_groups.length).to.eql(0)
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .patch(`/v1/educators/${result.id}`)
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

    describe('PATCH /v1/educators/:educator_id', () => {
        context('when the update was successful', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()

                    result = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 200 and updated educator', () => {
                return request
                    .patch(`/v1/educators/${result.id}`)
                    .send({ username: 'other_username' })
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
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    result = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 409 and info message from duplicate value', async () => {
                return request
                    .patch(`/v1/educators/${result.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql('Educator is already registered!')
                    })
            })
        })

        context('when a validation error occurs', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {
                const body = {
                    password: 'mysecretkey'
                }

                return request
                    .patch(`/v1/educators/${defaultEducator.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('This parameter could not be updated.')
                        expect(err.body.description).to.eql('A specific route to update user password already exists.' +
                            `Access: PATCH /users/${defaultEducator.id}/password to update your password.`)
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {
                return request
                    .patch(`/v1/educators/${defaultEducator.id}`)
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
                    .patch(`/v1/educators/${defaultEducator.id}`)
                    .send({ institution_id: '123' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the educator is not found', () => {
            it('should return status code 404 and info message from educator not found', () => {
                return request
                    .patch(`/v1/educators/${new ObjectID()}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.EDUCATOR.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.EDUCATOR.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the educator_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch('/v1/educators/123')
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

    describe('POST /v1/educators/:educator_id/children/groups', () => {
        context('when posting a new children group', () => {
            let resultEducator
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

                    resultEducator = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 201 and a children group', () => {
                const body = {
                    name: defaultChildrenGroup.name,
                    children: new Array<string | undefined>(resultChild.id),
                    school_class: defaultChildrenGroup.school_class
                }

                return request
                    .post(`/v1/educators/${resultEducator.id}/children/groups`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body.children.length).to.eql(1)
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0].username).to.eql(defaultChild.username)
                        expect(res.body.children[0].institution_id).to.eql(institution.id)
                        expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body.children[0].age).to.eql(defaultChild.age)
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            let resultEducator
            let resultChild

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultEducator = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
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
                        user_id: resultEducator.id
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 409 and info message about duplicate items', () => {
                const body = {
                    name: defaultChildrenGroup.name,
                    children: new Array<string | undefined>(resultChild.id),
                    school_class: defaultChildrenGroup.school_class
                }

                return request
                    .post(`/v1/educators/${resultEducator.id}/children/groups`)
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

                    result = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 400 and info message from invalid or missing parameters', () => {
                return request
                    .post(`/v1/educators/${result.id}/children/groups`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Children Group validation: name, Collection with children ' +
                            'IDs is required!')
                    })
            })
        })

        context('when the children id (ids) is (are) invalid', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()

                    result = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 400 and info message from invalid ID', () => {
                const body = {
                    name: 'Children Group One',
                    children: new Array<string | undefined>('123'),
                    school_class: '3th Grade'
                }

                return request
                    .post(`/v1/educators/${result.id}/children/groups`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Children Group validation: Collection with children IDs ' +
                            '(ID can not be empty) is required!')
                    })
            })
        })

        context('when the children id(ids) does not exists in database', () => {
            let result

            before(async () => {
                try {
                    await deleteAllUsers()

                    result = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 400 and info message from invalid ID', () => {
                const body = {
                    name: 'Children Group Two',
                    children: new Array<string | undefined>('507f1f77bcf86cd799439011'),
                    school_class: '3th Grade'
                }

                return request
                    .post(`/v1/educators/${result.id}/children/groups`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        expect(err.body.description).to.eql(Strings.CHILD.IDS_WITHOUT_REGISTER.concat(' ')
                            .concat('507f1f77bcf86cd799439011'))
                    })
            })
        })
    })

    describe('GET /v1/educators/:educator_id/children/groups/:group_id', () => {
        context('when want get a unique children group', () => {
            let resultEducator
            let resultChild
            let resultChildrenGroup

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultEducator = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
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
                        user_id: resultEducator.id
                    })

                    await updateUser({
                        id: resultEducator.id,
                        children_groups: new Array(resultChildrenGroup.id)
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 200 and a children group', () => {
                return request
                    .get(`/v1/educators/${resultEducator.id}/children/groups/${resultChildrenGroup.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body.children.length).to.eql(1)
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0].username).to.eql(defaultChild.username)
                        expect(res.body.children[0].institution_id).to.eql(institution.id)
                        expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body.children[0].age).to.eql(defaultChild.age)
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })
        })

        context('when the children group is not found', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 404 and info message from children group not found', () => {
                return request
                    .get(`/v1/educators/${defaultEducator.id}/children/groups/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILDREN_GROUP.NOT_FOUND)
                        expect(err.body.description).to.eql(Strings.CHILDREN_GROUP.NOT_FOUND_DESCRIPTION)
                    })
            })
        })

        context('when the children group_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .get(`/v1/educators/${defaultEducator.id}/children/groups/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILDREN_GROUP.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('PATCH /v1/educators/:educator_id/children/groups/:group_id', () => {
        context('when the update was successful', () => {
            let resultEducator
            let resultChild
            let resultChildrenGroup

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultEducator = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
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
                        user_id: resultEducator.id
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 200 and a updated children group', () => {
                return request
                    .patch(`/v1/educators/${resultEducator.id}/children/groups/${resultChildrenGroup.id}`)
                    .send({ school_class: '5th Grade' })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body.children.length).to.eql(1)
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0].username).to.eql(defaultChild.username)
                        expect(res.body.children[0].institution_id).to.eql(institution.id)
                        expect(res.body.children[0].gender).to.eql(defaultChild.gender)
                        expect(res.body.children[0].age).to.eql(defaultChild.age)
                        expect(res.body.school_class).to.eql('5th Grade')
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            let resultEducator
            let resultChild
            let resultChildrenGroup

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultEducator = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
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
                        user_id: resultEducator.id
                    })

                    await createChildrenGroup({
                        name: 'anothercoolname',
                        children: new Array<string | undefined>(defaultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultEducator.id
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 409 and info message about duplicate items', async () => {
                return request
                    .patch(`/v1/educators/${resultEducator.id}/children/groups/${resultChildrenGroup.id}`)
                    .send({ name: 'anothercoolname' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql('Children Group is already registered!')
                    })
            })
        })

        context('when the children group was updated with a not existent child id', () => {
            let resultEducator
            let resultChild
            let resultChildrenGroup

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultEducator = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
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
                        user_id: resultEducator.id
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 400 and info message for invalid child id', () => {
                return request
                    .patch(`/v1/educators/${resultEducator.id}/children/groups/${resultChildrenGroup.id}`)
                    .send({ children: new Array<string>('507f1f77bcf86cd799439011') })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILD.CHILDREN_REGISTER_REQUIRED)
                        expect(err.body.description).to.eql(Strings.CHILD.IDS_WITHOUT_REGISTER.concat(' ')
                            .concat('507f1f77bcf86cd799439011'))
                    })
            })
        })

        context('when the children group was updated with a invalid child id', () => {
            let resultEducator
            let resultChild
            let resultChildrenGroup

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultEducator = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
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
                        user_id: resultEducator.id
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch(`/v1/educators/${resultEducator.id}/children/groups/${resultChildrenGroup.id}`)
                    .send({ children: new Array<string>('123') })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Children Group validation: Collection with children IDs ' +
                            '(ID can not be empty) is required!')
                    })
            })
        })
    })

    describe('DELETE /v1/educators/:educator_id/children/groups/:group_id', () => {
        context('when the delete was successful', () => {
            let resultEducator
            let resultChild
            let resultChildrenGroup

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultEducator = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
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
                        user_id: resultEducator.id
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 204 and no content', () => {
                return request
                    .delete(`/v1/educators/${resultEducator.id}/children/groups/${resultChildrenGroup.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the children group is not founded', () => {
            let resultEducator

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultEducator = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 204', () => {
                return request
                    .delete(`/v1/educators/${resultEducator.id}/children/groups/${new ObjectID()}`)
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
                    .delete(`/v1/educators/${defaultEducator.id}/children/groups/123}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.CHILDREN_GROUP.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('GET /v1/educators/:educator_id/children/groups', () => {
        context('when want all children groups from educator', () => {
            let resultEducator
            let resultChild
            let resultChildrenGroup
            let resultChildrenGroup2

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultEducator = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
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
                        user_id: resultEducator.id
                    })

                    resultChildrenGroup2 = await createChildrenGroup({
                        name: 'other_children_group_name',
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultEducator.id
                    })

                    await updateUser({
                        id: resultEducator.id,
                        children_groups: [resultChildrenGroup.id, resultChildrenGroup2.id]
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 200 and a list of children groups', () => {
                return request
                    .get(`/v1/educators/${resultEducator.id}/children/groups`)
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
            let resultEducator
            let resultChild
            let resultChildrenGroup
            let resultChildrenGroup2

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultEducator = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
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
                        user_id: resultEducator.id
                    })

                    resultChildrenGroup2 = await createChildrenGroup({
                        name: 'other_children_group_name',
                        children: new Array<string | undefined>(resultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: resultEducator.id
                    })

                    await updateUser({
                        id: resultEducator.id,
                        children_groups: [resultChildrenGroup.id, resultChildrenGroup2.id]
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return the result as required in query', () => {
                const url = `/v1/educators/${resultEducator.id}/children/groups?name=other_children_group_name&sort=name&page=1&limit=3`
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
            let resultEducator

            before(async () => {
                try {
                    await deleteAllUsers()

                    resultEducator = await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read'),
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 200 and a empty array', async () => {
                try {
                    await deleteAllChildrenGroups().then()
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }

                return request
                    .get(`/v1/educators/${resultEducator.id}/children/groups`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })

            })
        })
    })

    describe('GET /v1/educators', () => {
        context('when want get all educators in database', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    await createUser({
                        username: 'other_username',
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 200 and a list of educators', () => {
                return request
                    .get('/v1/educators')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(2)
                        for (const educator of res.body) {
                            expect(educator).to.have.property('id')
                            expect(educator).to.have.property('username')
                            expect(educator).to.have.property('institution_id')
                            expect(educator).to.have.property('children_groups')
                        }
                    })
            })
        })

        context('when use query strings', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    await createUser({
                        username: defaultEducator.username,
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })

                    await createUser({
                        username: 'other_username',
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: new ObjectID(institution.id),
                        scopes: new Array('users:read')
                    })
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return the result as required in query', async () => {
                const url: string = '/v1/educators?sort=username&page=1&limit=3'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(2)
                        for (const educator of res.body) {
                            expect(educator).to.have.property('id')
                            expect(educator).to.have.property('username')
                            expect(educator).to.have.property('institution_id')
                            expect(educator).to.have.property('children_groups')
                        }
                    })
            })
        })

        context('when there are no institutions in database', () => {
            before(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Educator test: ' + err.message)
                }
            })
            it('should return status code 200 and a empty array', async () => {
                return request
                    .get('/v1/educators')
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
