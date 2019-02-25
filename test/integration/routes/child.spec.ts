import { Institution } from '../../../src/application/domain/model/institution'
import { UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { Container } from 'inversify'
import { DI } from '../../../src/di/di'
import { IDBConnection } from '../../../src/infrastructure/port/db.connection.interface'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { Child } from '../../../src/application/domain/model/child'
import { expect } from 'chai'
import { ObjectID } from 'bson'

const container: Container = DI.getInstance().getContainer()
const dbConnection: IDBConnection = container.get(Identifier.MONGODB_CONNECTION)
const app: App = container.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Child', () => {

    const institution: Institution = new Institution()

    const defaultChild: Child = new Child()
    defaultChild.username = 'child'
    defaultChild.password = 'mysecretkey'
    defaultChild.institution = institution
    defaultChild.type = UserType.CHILD
    defaultChild.age = 13
    defaultChild.gender = 'male'

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
                throw new Error('Failure on Child test: ' + err.message)
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

    describe('POST /users/children', () => {
        context('when posting a new child user', () => {
            it('should return status code 201 and the saved child', () => {
                const body = {
                    username: defaultChild.username,
                    password: defaultChild.password,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution_id: institution.id
                }

                return request
                    .post('/users/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body).to.have.property('gender')
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body).to.have.property('age')
                        expect(res.body.age).to.eql(defaultChild.age)
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
                    .post('/users/children')
                    .send(body)
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
                    username: defaultChild.username,
                    age: defaultChild.age
                }

                return request
                    .post('/users/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
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
                    .post('/users/children')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
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
                    .post('/users/children')
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

    describe('GET /users/children/:child_id', () => {
        context('when get a unique child in database', () => {
            it('should return status code 200 and a child', () => {
                return request
                    .get(`/users/children/${defaultChild.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body).to.have.property('gender')
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body).to.have.property('age')
                        expect(res.body.age).to.eql(defaultChild.age)
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
                    })
            })
        })

        context('when the child is not found', () => {
            it('should return status code 404 and info message from child not found', () => {
                return request
                    .get(`/users/children/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the child_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {
                return request
                    .get('/users/children/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('PATCH /users/children/:child_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and updated child', () => {
                defaultChild.age = 9

                return request
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ age: 9 })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(defaultChild.id)
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultChild.username)
                        expect(res.body).to.have.property('gender')
                        expect(res.body.gender).to.eql(defaultChild.gender)
                        expect(res.body).to.have.property('age')
                        expect(res.body.age).to.eql(defaultChild.age)
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
                    })
            })
        })

        context('when a duplication error occurs', () => {
            it('should return status code 409 and info message from duplicate value', () => {
                createUser({
                    username: 'anothercoolusername',
                    password: defaultChild.password,
                    type: UserType.CHILD,
                    gender: defaultChild.gender,
                    age: defaultChild.age,
                    institution: institution.id,
                    scopes: new Array('users:read')
                }).then()

                return request
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {
                return request
                    .patch(`/users/children/${defaultChild.id}`)
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
                    .patch(`/users/children/${defaultChild.id}`)
                    .send({ institution_id: '123' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the child is not found', () => {
            it('should return status code 404 and info message from child not found', () => {
                return request
                    .patch(`/users/children/${new ObjectID()}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the child_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch('/users/children/123')
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

    describe('GET /users/children', () => {
        context('when want get all applications in database', () => {
            it('should return status code 200 and a list of children', () => {
                return request
                    .get('/users/children')
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
                        expect(res.body[0]).to.have.property('age')
                        expect(res.body[0]).to.have.property('gender')
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
                        expect(res.body[1]).to.have.property('age')
                        expect(res.body[1]).to.have.property('gender')
                    })
            })
        })

        context('when there are no children in database', () => {
            it('should return status code 200 and a empty array', () => {
                deleteAllUsers({}).then()

                return request
                    .get('/users/children')
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
