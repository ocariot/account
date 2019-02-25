import { expect } from 'chai'
import { App } from '../../../src/app'
import { Identifier } from '../../../src/di/identifiers'
import { DI } from '../../../src/di/di'
import { Institution } from '../../../src/application/domain/model/institution'
import { Application } from '../../../src/application/domain/model/application'
import { UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { IDBConnection } from '../../../src/infrastructure/port/db.connection.interface'
import { Container } from 'inversify'
import { ObjectID } from 'bson'

const container: Container = DI.getInstance().getContainer()
const dbConnection: IDBConnection = container.get(Identifier.MONGODB_CONNECTION)
const app: App = container.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Application', () => {

    const institution: Institution = new Institution()

    const defaultApplication: Application = new Application()
    defaultApplication.username = 'application'
    defaultApplication.password = 'mysecretkey'
    defaultApplication.application_name = 'application test'
    defaultApplication.institution = institution
    defaultApplication.type = UserType.APPLICATION

    before(async () => {
            try {
                await dbConnection.tryConnect()
                await deleteAllUsers({})
                await deleteAllInstitutions({})

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
            await deleteAllUsers({})
            await deleteAllInstitutions({})
            await dbConnection.dispose()
        } catch (err) {
            throw new Error('Failure on Child test: ' + err.message)
        }
    })

    describe('POST /users/applications', () => {
        context('when posting a new application user', () => {
            it('should return status code 201 and the saved application', () => {

                const body = {
                    username: defaultApplication.username,
                    password: 'mysecretkey',
                    application_name: defaultApplication.application_name,
                    institution_id: institution.id
                }

                return request
                    .post('/users/applications')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultApplication.username)
                        expect(res.body).to.have.property('institution')
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution).to.have.property('type')
                        expect(res.body.institution.type).to.eql('Any Type')
                        expect(res.body.institution).to.have.property('name')
                        expect(res.body.institution.name).to.eql('Name Example')
                        expect(res.body.institution).to.have.property('address')
                        expect(res.body.institution.address).to.eql('221B Baker Street, St.')
                        expect(res.body.institution).to.have.property('latitude')
                        expect(res.body.institution.latitude).to.eql(0)
                        expect(res.body.institution).to.have.property('longitude')
                        expect(res.body.institution.longitude).to.eql(0)
                        expect(res.body).to.have.property('application_name')
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
                    .post('/users/applications')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Application is already registered!')
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
                    .post('/users/applications')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
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
                    .post('/users/applications')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
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
                    .post('/users/applications')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('GET /users/applications/:application_id', () => {
        context('when get a unique application in database', () => {
            it('should return status code 200 and a application', () => {
                return request
                    .get(`/users/applications/${defaultApplication.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(defaultApplication.id)
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultApplication.username)
                        expect(res.body).to.have.property('institution')
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution).to.have.property('type')
                        expect(res.body.institution.type).to.eql('Any Type')
                        expect(res.body.institution).to.have.property('name')
                        expect(res.body.institution.name).to.eql('Name Example')
                        expect(res.body.institution).to.have.property('address')
                        expect(res.body.institution.address).to.eql('221B Baker Street, St.')
                        expect(res.body.institution).to.have.property('latitude')
                        expect(res.body.institution.latitude).to.eql(0)
                        expect(res.body.institution).to.have.property('longitude')
                        expect(res.body.institution.longitude).to.eql(0)
                        expect(res.body).to.have.property('application_name')
                        expect(res.body.application_name).to.eql(defaultApplication.application_name)
                    })
            })
        })

        context('when the application is not found', () => {
            it('should return status code 404 and info message from application not found', () => {
                return request
                    .get(`/users/applications/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the application_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .get('/users/applications/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('PATCH /users/applications/:application_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and updated application', () => {
                defaultApplication.application_name = 'newnameforapplication'

                return request
                    .patch(`/users/applications/${defaultApplication.id}`)
                    .send({ application_name: defaultApplication.application_name })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(defaultApplication.id)
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultApplication.username)
                        expect(res.body).to.have.property('institution')
                        expect(res.body.institution).to.have.property('id')
                        expect(res.body.institution).to.have.property('type')
                        expect(res.body.institution.type).to.eql('Any Type')
                        expect(res.body.institution).to.have.property('name')
                        expect(res.body.institution.name).to.eql('Name Example')
                        expect(res.body.institution).to.have.property('address')
                        expect(res.body.institution.address).to.eql('221B Baker Street, St.')
                        expect(res.body.institution).to.have.property('latitude')
                        expect(res.body.institution.latitude).to.eql(0)
                        expect(res.body.institution).to.have.property('longitude')
                        expect(res.body.institution.longitude).to.eql(0)
                        expect(res.body).to.have.property('application_name')
                        expect(res.body.application_name).to.eql(defaultApplication.application_name)
                    })
            })
        })

        context('when a duplication error occurs', () => {
            it('should return status code 409 and info message from duplicate value', () => {

                createUser({
                    username: 'acoolusername',
                    password: 'mysecretkey',
                    application_name: defaultApplication.application_name,
                    institution: new ObjectID(institution.id),
                    type: UserType.APPLICATION
                }).then()

                return request
                    .patch(`/users/applications/${defaultApplication.id}`)
                    .send({ username: 'acoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                    })
            })
        })

        context('when a validation error occurs', () => {
            it('should return status code 400 and message info about missing or invalid parameters', () => {
                const body = {
                    password: 'mysecretkey'
                }

                return request
                    .patch(`/users/applications/${defaultApplication.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {
                return request
                    .patch(`/users/applications/${defaultApplication.id}`)
                    .send({ institution_id: new ObjectID() })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the institution id provided was invalid', () => {
            it('should return status code 400 and message for invalid institution id', () => {
                return request
                    .post('/users/applications')
                    .send({ institution_id: '123' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the application is not found', () => {
            it('should return status code 404 and info message from application not found', () => {
                return request
                    .patch(`/users/applications/${new ObjectID()}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the application_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch('/users/applications/123')
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('GET /users/applications/', () => {
        context('when want get all applications in database', () => {
            it('should return status code 200 and a list of applications', () => {
                return request
                    .get('/users/applications')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0].institution).to.have.property('id')
                        expect(res.body[0].institution).to.have.property('type')
                        expect(res.body[0].institution.type).to.eql('Any Type')
                        expect(res.body[0].institution).to.have.property('name')
                        expect(res.body[0].institution.name).to.eql('Name Example')
                        expect(res.body[0].institution).to.have.property('address')
                        expect(res.body[0].institution.address).to.eql('221B Baker Street, St.')
                        expect(res.body[0].institution).to.have.property('latitude')
                        expect(res.body[0].institution.latitude).to.eql(0)
                        expect(res.body[0].institution).to.have.property('longitude')
                        expect(res.body[0].institution.longitude).to.eql(0)
                        expect(res.body[0]).to.have.property('application_name')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1].institution).to.have.property('id')
                        expect(res.body[1].institution).to.have.property('type')
                        expect(res.body[1].institution.type).to.eql('Any Type')
                        expect(res.body[1].institution).to.have.property('name')
                        expect(res.body[1].institution.name).to.eql('Name Example')
                        expect(res.body[1].institution).to.have.property('address')
                        expect(res.body[1].institution.address).to.eql('221B Baker Street, St.')
                        expect(res.body[1].institution).to.have.property('latitude')
                        expect(res.body[1].institution.latitude).to.eql(0)
                        expect(res.body[1].institution).to.have.property('longitude')
                        expect(res.body[1].institution.longitude).to.eql(0)
                        expect(res.body[1]).to.have.property('application_name')
                    })
            })
        })

        context('when there are no applications in database', () => {
            it('should return status code 200 and a empty array', () => {
                deleteAllUsers({}).then()

                return request
                    .get('/users/applications')
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

async function deleteAllUsers(doc) {
    return await UserRepoModel.deleteMany(doc)
}

async function createInstitution(item) {
    return await InstitutionRepoModel.create(item)
}

async function deleteAllInstitutions(doc) {
    return await InstitutionRepoModel.deleteMany(doc)
}
