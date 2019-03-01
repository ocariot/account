import { expect } from 'chai'
import { Container } from 'inversify'
import { DI } from '../../../src/di/di'
import { IConnectionDB } from '../../../src/infrastructure/port/connection.db.interface'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { Institution } from '../../../src/application/domain/model/institution'
import { ObjectID } from 'bson'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { UserType } from '../../../src/application/domain/model/user'

const container: Container = DI.getInstance().getContainer()
const dbConnection: IConnectionDB = container.get(Identifier.MONGODB_CONNECTION)
const app: App = container.get(Identifier.APP)
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
                await dbConnection.tryConnect(0, 500)
                await deleteAllInstitutions({})
            } catch (err) {
                throw new Error('Failure on Child test: ' + err.message)
            }
        }
    )

    after(async () => {
        try {
            await deleteAllInstitutions({})
            await deleteAllUsers({})
            await dbConnection.dispose()
        } catch (err) {
            throw new Error('Failure on Child test: ' + err.message)
        }
    })

    describe('POST /institutions', () => {
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
                    .post('/institutions')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('type')
                        expect(res.body.type).to.eql(defaultInstitution.type)
                        expect(res.body).to.have.property('name')
                        expect(res.body.name).to.eql(defaultInstitution.name)
                        expect(res.body).to.have.property('address')
                        expect(res.body.address).to.eql(defaultInstitution.address)
                        expect(res.body).to.have.property('latitude')
                        expect(res.body.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body).to.have.property('longitude')
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
                    .post('/institutions')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                    })
            })
        })

        context('when a validation error occurs', () => {
            it('should return status code 400 and info message from invalid or missing parameters', () => {
                const body = {
                    type: 'Another Type'
                }

                return request
                    .post('/institutions')
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

    describe('GET /institutions/:institution_id', () => {
        context('when get a unique institution in database', () => {
            it('should return status code 200 and a institution', () => {
                return request
                    .get(`/institutions/${defaultInstitution.id}`)
                    .set('Content-Type', 'application/json')
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(defaultInstitution.id)
                        expect(res.body).to.have.property('type')
                        expect(res.body.type).to.eql(defaultInstitution.type)
                        expect(res.body).to.have.property('name')
                        expect(res.body.name).to.eql(defaultInstitution.name)
                        expect(res.body).to.have.property('address')
                        expect(res.body.address).to.eql(defaultInstitution.address)
                        expect(res.body).to.have.property('latitude')
                        expect(res.body.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body).to.have.property('longitude')
                        expect(res.body.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when the institution is not found', () => {
            it('should return status code 404 and info message from institution not found', () => {
                return request
                    .get(`/institutions/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the institution is in invalid format', () => {
            it('should return status code 400 and info message from invalid ID format', () => {
                return request
                    .get('/institutions/123')
                    .set('Content-Type', 'application/json')
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('PATCH /institutions/:institution_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and a updated institution', () => {
                defaultInstitution.type = 'Another Cool Type'

                return request
                    .patch(`/institutions/${defaultInstitution.id}`)
                    .send({ type: 'Another Cool Type' })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(defaultInstitution.id)
                        expect(res.body).to.have.property('type')
                        expect(res.body.type).to.eql(defaultInstitution.type)
                        expect(res.body).to.have.property('name')
                        expect(res.body.name).to.eql(defaultInstitution.name)
                        expect(res.body).to.have.property('address')
                        expect(res.body.address).to.eql(defaultInstitution.address)
                        expect(res.body).to.have.property('latitude')
                        expect(res.body.latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body).to.have.property('longitude')
                        expect(res.body.longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when a duplication error occurs', () => {
            it('should return status code 409 and info message from duplicate items', async () => {
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

                return request
                    .patch(`/institutions/${defaultInstitution.id}`)
                    .send({ name: 'Other Name' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                    })
            })
        })

        context('when the institution is not found', () => {
            it('should return status code 404 and info message from institution not found', () => {
                return request
                    .patch(`/institutions/${new ObjectID()}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the institution_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch('/institutions/123')
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

    describe('DELETE /institutions/:institution_id', () => {
        context('when the deletion was successful', () => {
            it('should return status code 204 and no content', () => {
                return request
                    .delete(`/institutions/${anotherInstitution.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the institution was asscociated with an user', () => {
            it('should return status code 400 and info message from existent association', async () => {
                await createUser({
                    username: 'anothercoolusername',
                    password: 'mysecretkey',
                    type: UserType.CHILD,
                    gender: 'male',
                    age: 11,
                    institution: defaultInstitution.id,
                    scopes: new Array('users:read')
                }).then()

                return request
                    .delete(`/institutions/${defaultInstitution.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                    })
            })
        })

        context('when the institution is not found', () => {
            it('should return status code 204 and no content, even the institution was not founded', () => {
                return request
                    .delete(`/institutions/${new ObjectID()}`)
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
                    .delete('/institutions/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('GET /institutions', () => {
        context('when want get all institutions in database', () => {
            it('should return status coe 200 and a list of institutions', () => {
                return request
                    .get('/institutions')
                    .set('Content-Type', 'application/json')
                    .then(res => {
                        expect(res.body).is.instanceof(Array)
                        expect(res.body.length).is.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].id).to.eql(defaultInstitution.id)
                        expect(res.body[0]).to.have.property('type')
                        expect(res.body[0].type).to.eql(defaultInstitution.type)
                        expect(res.body[0]).to.have.property('name')
                        expect(res.body[0].name).to.eql(defaultInstitution.name)
                        expect(res.body[0]).to.have.property('address')
                        expect(res.body[0].address).to.eql(defaultInstitution.address)
                        expect(res.body[0]).to.have.property('latitude')
                        expect(res.body[0].latitude).to.eql(defaultInstitution.latitude)
                        expect(res.body[0]).to.have.property('longitude')
                        expect(res.body[0].longitude).to.eql(defaultInstitution.longitude)
                    })
            })
        })

        context('when does not have users in database', () => {
            it('should return status code 200 and a empty array', async () => {
                await deleteAllInstitutions({}).then()

                return request
                    .get('/institutions')
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

async function deleteAllUsers(doc) {
    return await UserRepoModel.deleteMany(doc)
}

async function createInstitution(item) {
    return await InstitutionRepoModel.create(item)
}

async function deleteAllInstitutions(doc) {
    return await InstitutionRepoModel.deleteMany(doc)
}
