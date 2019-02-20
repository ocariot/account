import { Container } from 'inversify'
import { DI } from '../../../src/di/di'
import { IDBConnection } from '../../../src/infrastructure/port/db.connection.interface'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { Family } from '../../../src/application/domain/model/family'
import { expect } from 'chai'
import { ObjectID } from 'bson'
import { Institution } from '../../../src/application/domain/model/institution'
import { UserType } from '../../../src/application/domain/model/user'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { Child } from '../../../src/application/domain/model/child'
import { IChildService } from '../../../src/application/port/child.service.interface'

const container: Container = DI.getInstance().getContainer()
const dbConnection: IDBConnection = container.get(Identifier.MONGODB_CONNECTION)
const childService: IChildService = container.get(Identifier.CHILD_SERVICE)
const app: App = container.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Family', () => {
    const institution: Institution = new Institution()

    const defaultFamily: Family = new Family()
    defaultFamily.username = 'family'
    defaultFamily.password = 'mysecretkey'
    defaultFamily.institution = institution
    defaultFamily.type = UserType.FAMILY

    const child = new Child()
    child.username = 'anothercoolusername'
    child.password = 'mysecretkey'
    child.gender = 'male'
    child.age = 11
    child.type = UserType.CHILD
    child.institution = institution

    const anotherChild = new Child()

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

                const savedChild = await childService.add(child)
                child.id = savedChild.id
                defaultFamily.children = new Array<Child>(savedChild)
            } catch (err) {
                throw new Error('Failure on health professional test: ' + err.message)
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

    describe('POST /users/families', () => {
        context('when posting a new family user', () => {
            it('should return status code 201 and the saved family', () => {
                const body = {
                    username: defaultFamily.username,
                    password: defaultFamily.password,
                    children: [child.id],
                    institution_id: institution.id
                }

                return request
                    .post('/users/families')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body).to.have.property('institution')
                        expect(res.body).to.have.property('children')
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).is.eql(1)
                        defaultFamily.id = res.body.id
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and message info about duplicate items', () => {
                const body = {
                    username: defaultFamily.username,
                    password: defaultFamily.password,
                    children: [child.id],
                    institution_id: institution.id
                }

                return request
                    .post('/users/families')
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
                    password: defaultFamily.password
                }

                return request
                    .post('/users/families')
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
                    password: defaultFamily.password,
                    children: [child.id],
                    institution_id: new ObjectID()
                }

                return request
                    .post('/users/families')
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
                    password: defaultFamily.password,
                    children: [child.id],
                    institution_id: '123'
                }

                return request
                    .post('/users/families')
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

    describe('GET /users/families/:family_id', () => {
        context('when get a unique family in database', () => {
            it('should return status code 200 and a family', () => {
                return request
                    .get(`/users/families/${defaultFamily.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(defaultFamily.id)
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body).to.have.property('institution')
                        expect(res.body).to.have.property('children')
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).is.eql(1)
                    })
            })
        })

        context('when the family is not found', () => {
            it('should return status code 404 and info message from family not found', () => {
                return request
                    .get(`/users/families/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the family_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {
                return request
                    .get('/users/families/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('PATCH /users/families/:family_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and updated family', () => {
                defaultFamily.username = 'newcoolusername'

                return request
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ username: 'newcoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(defaultFamily.id)
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body).to.have.property('institution')
                        expect(res.body).to.have.property('children')
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).is.eql(1)
                    })
            })
        })

        context('when a duplication error occurs', () => {
            it('should return status code 409 and info message from duplicate value', () => {
                createUser({
                    username: 'acoolusername',
                    password: defaultFamily.password,
                    type: UserType.FAMILY,
                    institution: institution.id,
                    scopes: new Array('users:read')
                }).then()

                return request
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ username: 'acoolusername' })
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
                    .patch(`/users/families/${defaultFamily.id}`)
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
            it(' should return status code 400 and message for invalid institution id', () => {
                return request
                    .patch(`/users/families/${defaultFamily.id}`)
                    .send({ institution_id: '123' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the family is not found', () => {
            it('should return status code 404 and info message from family not found', () => {
                return request
                    .patch(`/users/families/${new ObjectID()}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the family_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch('/users/families/123')
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

    describe('POST /users/families/:family_id/children/:child_id', () => {
        context('when want associate a child with a family', () => {
            it('should return status code 200 and a family', async () => {

                anotherChild.username = 'ihaveauniqueusername'
                anotherChild.password = 'mysecretkey'
                anotherChild.gender = 'male'
                anotherChild.age = 11
                anotherChild.type = UserType.CHILD
                anotherChild.institution = institution

                await childService.add(anotherChild).then(item => {
                    anotherChild.id = item.id
                })

                request
                    .post(`/users/families/${defaultFamily.id}/children/${anotherChild.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(defaultFamily.id)
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body).to.have.property('institution')
                        expect(res.body).to.have.property('children')
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).is.eql(2)
                    })
            })
        })

        context('when the child id does not exists', () => {
            it('should return status code 400 and info message from invalid child ID', () => {
                request
                    .post(`/users/families/${defaultFamily.id}/children/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                    })
            })
        })

        context('when the child id is invalid', () => {
            it('should return status code 400 and info message from invalid child ID', () => {
                request
                    .post(`/users/families/${defaultFamily.id}/children/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('DELETE /users/families/:family_id/children/:child_id', () => {
        context('when want disassociate a child from a family', () => {
            it('should return status code 204 and no content', () => {
                request
                    .delete(`/users/families/${defaultFamily.id}/children/${anotherChild.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the child id does not exists', () => {
            it('should return status code 204 and no content, even the child id does not exists', () => {
                request
                    .delete(`/users/families/${defaultFamily.id}/children/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the child id is invalid', () => {
            it('should return status code 400 and info message about invalid child id', () => {
                request
                    .delete(`/users/families/${defaultFamily.id}/children/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('GET /users/families/:family_id/children', () => {
        context('when want get all children from family', () => {
            it('should return status code 200 and the family', () => {
                request
                    .get(`/users/families/${defaultFamily.id}/children`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceof(Array)
                        expect(res.body.length).is.eql(2)
                    })
            })
        })

        context('when there no are children groups associated with an user', () => {
            it('should return status code 200 and empty array', async () => {
                await deleteAllChildrenFromFamily(defaultFamily.id)

                request
                    .get(`/users/families/${defaultFamily.id}/children`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceof(Array)
                        expect(res.body.length).is.eql(0)
                    })

            })
        })

        context('when family id does not exists', () => {
            it('should return status code 404 and info message from family not found', () => {
                request
                    .get(`/users/families/${new ObjectID()}/children`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when family id is invalid', () => {
            it('should return status code 400 and info message invalid family id', () => {
                request
                    .get('/users/families/123/children')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('GET /users/families', () => {
        context('when want get all families in database', () => {
            it('should return status code 200 and a list of users', () => {
                return request
                    .get('/users/families')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                    })
            })
        })

        context('when there are no institutions in database', () => {
            it('should return status code 200 and a empty array', () => {
                deleteAllUsers({}).then()

                return request
                    .get('/users/families')
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

async function deleteAllChildrenFromFamily(id) {
    return await UserRepoModel.updateOne({ _id: id }, { $set: { children: [] } })
}
