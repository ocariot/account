import { Container } from 'inversify'
import { DI } from '../../../src/di/di'
import { IDBConnection } from '../../../src/infrastructure/port/db.connection.interface'
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

const container: Container = DI.getInstance().getContainer()
const dbConnection: IDBConnection = container.get(Identifier.MONGODB_CONNECTION)
const app: App = container.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: HealthProfessional', () => {
    const institution: Institution = new Institution()

    const defaultHealthProfessional: HealthProfessional = new HealthProfessional()
    defaultHealthProfessional.username = 'healthprofessional'
    defaultHealthProfessional.password = 'mysecretkey'
    defaultHealthProfessional.institution = institution
    defaultHealthProfessional.type = UserType.HEALTH_PROFESSIONAL

    const defaultChild: Child = new Child()
    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
    const anotherChildrenGroup: ChildrenGroup = new ChildrenGroup()

    before(async () => {
            try {
                await dbConnection.tryConnect()
                await deleteAllUsers({})
                await deleteAllInstitutions({})
                await deleteAllChildrenGroups({})

                const item = await createInstitution({
                    type: 'Any Type',
                    name: 'Name Example',
                    address: '221B Baker Street, St.',
                    latitude: 0,
                    longitude: 0
                })
                institution.id = item._id

                const child = await createUser({
                    username: 'anotherusername',
                    password: 'mysecretkey',
                    type: UserType.CHILD,
                    gender: 'male',
                    age: 11,
                    institution: institution.id,
                    scopes: new Array('users:read')
                }).then()

                defaultChild.id = child.id

            } catch (err) {
                throw new Error('Failure on Child test: ' + err.message)
            }
        }
    )

    after(async () => {
        try {
            await deleteAllUsers({})
            await deleteAllInstitutions({})
            await deleteAllChildrenGroups({})
            await dbConnection.dispose()
        } catch (err) {
            throw new Error('Failure on Child test: ' + err.message)
        }
    })

    describe('POST /users/healthprofessionals', () => {
        context('when posting a new health professional user', () => {
            it('should return status code 201 and the saved health professional', () => {
                const body = {
                    username: defaultHealthProfessional.username,
                    password: defaultHealthProfessional.password,
                    institution_id: institution.id
                }

                return request
                    .post('/users/healthprofessionals')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultHealthProfessional.username)
                        expect(res.body).to.have.property('institution')
                        defaultHealthProfessional.id = res.body.id
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and message info about duplicate items', () => {
                const body = {
                    username: defaultHealthProfessional.username,
                    password: defaultHealthProfessional.password,
                    institution_id: institution.id
                }

                return request
                    .post('/users/healthprofessionals')
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
                    password: defaultHealthProfessional.password
                }

                return request
                    .post('/users/healthprofessionals')
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
                    password: defaultHealthProfessional.password,
                    institution_id: new ObjectID()
                }

                return request
                    .post('/users/healthprofessionals')
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
                    password: defaultHealthProfessional.password,
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

    describe('GET /users/healthprofessionals/:healthprofessional_id', () => {
        context('when get a unique health professional in database', () => {
            it('should return status code 200 and a health professional', () => {
                return request
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(defaultHealthProfessional.id)
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultHealthProfessional.username)
                        expect(res.body).to.have.property('institution')
                    })
            })
        })

        context('when the health professional is not found', () => {
            it('should return status code 404 and info message from health professional not found', () => {
                return request
                    .get(`/users/healthprofessionals/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the healthprofessional_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {
                return request
                    .get('/users/healthprofessionals/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('PATCH /users/healthprofessionals/:healthprofessional_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and updated health professional', () => {
                defaultHealthProfessional.username = 'newcoolusername'

                return request
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ username: 'newcoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(defaultHealthProfessional.id)
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultHealthProfessional.username)
                        expect(res.body).to.have.property('institution')
                    })
            })
        })

        context('when a duplication error occurs', () => {
            it('should return status code 409 and info message from duplicate value', () => {
                createUser({
                    username: 'anothercoolusername',
                    password: defaultHealthProfessional.password,
                    type: UserType.HEALTH_PROFESSIONAL,
                    institution: institution.id,
                    scopes: new Array('users:read')
                }).then()

                return request
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
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
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
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
                    .patch(`/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ institution_id: '123' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the health professional is not found', () => {
            it('should return status code 404 and info message from health professional not found', () => {
                return request
                    .patch(`/users/healthprofessionals/${new ObjectID()}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the healthprofessional_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch('/users/healthprofessionals/123')
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

    describe('POST /users/healthprofessionals/:healthprofessional_id/children/groups', () => {
        context('when posting a new children group', () => {
            it('should return status code 201 and a children group', () => {

                defaultChildrenGroup.name = 'Children Group One'
                defaultChildrenGroup.school_class = '3th Grade'

                const body = {
                    name: defaultChildrenGroup.name,
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: defaultChildrenGroup.school_class
                }

                return request
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('name')
                        expect(res.body.name).to.eql(body.name)
                        expect(res.body).to.have.property('children')
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).to.eql(1)
                        expect(res.body).to.have.property('school_class')
                        expect(res.body.school_class).to.eql(body.school_class)
                        defaultChildrenGroup.id = res.body.id
                        defaultChildrenGroup.children = res.body.children
                    })
            })
        })

        context('when there are validation errors', () => {
            it('should return status code 400 and info message from invalid or missing parameters', () => {
                return request
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the children id(ids) is invalid', () => {
            it('should return status code 400 and info message from invalid ID', () => {
                const body = {
                    name: 'Children Group One',
                    children: new Array<string | undefined>('123'),
                    school_class: '3th Grade'
                }

                return request
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the children id(ids) does not exists in database', () => {
            it('should return status code 400 and info message from invalid ID', () => {
                const body = {
                    name: 'Children Group One',
                    children: new Array<string | undefined>(`${new ObjectID()}`),
                    school_class: '3th Grade'
                }

                return request
                    .post(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
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

    describe('GET /users/healthprofessionals/:healthprofessional_id/children/groups/group_id', () => {
        context('when want get a unique children group', () => {
            it('should return status code 200 and a children group', () => {

                const url = `/users/healthprofessionals/${defaultHealthProfessional.id}/`
                    .concat(`children/groups/${defaultChildrenGroup.id}`)

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('name')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body).to.have.property('children')
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).to.eql(1)
                        expect(res.body).to.have.property('school_class')
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                        defaultChildrenGroup.id = res.body.id
                    })
            })
        })

        context('when the children group is not found', () => {
            it('should return status code 404 and info message from children group not found', () => {

                const url = `/users/healthprofessionals/${defaultHealthProfessional.id}/`
                    .concat(`children/groups/${new ObjectID()}`)
                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        // TODO implement validation for children group
        context('when the children group_id is invalid', () => {
            it('should return status code 400 and info message from invalid ID', () => {
                return request
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('PATCH /users/healthprofessionals/:healthprofessional_id/children/groups/group_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and a updated children group', () => {
                defaultChildrenGroup.school_class = '5th Grade'

                const url = `/users/healthprofessionals/${defaultHealthProfessional.id}/`
                    .concat(`children/groups/${defaultChildrenGroup.id}`)

                return request
                    .patch(url)
                    .send({ school_class: defaultChildrenGroup.school_class })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('name')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body).to.have.property('children')
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).to.eql(1)
                        expect(res.body).to.have.property('school_class')
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                        defaultChildrenGroup.id = res.body.id
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and info message from duplicate items', () => {
                createChildrenGroup({
                    name: 'anothercoolname',
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: defaultChildrenGroup.school_class,
                    user_id: defaultHealthProfessional.id
                }).then(item => {
                    anotherChildrenGroup.id = item._id
                })

                const url = `/users/healthprofessionals/${defaultHealthProfessional.id}/`
                    .concat(`children/groups/${defaultChildrenGroup.id}`)

                return request
                    .patch(url)
                    .send({ name: 'anothercoolname' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                    })
            })
        })

        context('when the children group was updated with a not existent child id', () => {
            it('should return status code 400 and info message for invalid child id', () => {

                const url = `/users/healthprofessionals/${defaultHealthProfessional.id}/`
                    .concat(`children/groups/${defaultChildrenGroup.id}`)

                return request
                    .patch(url)
                    .send({ children: new Array<string>(`${new ObjectID()}`) })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the children group was updated with a invalid child id', () => {
            it('should return status code 400 and info message from invalid ID.', () => {

                const url = `/users/healthprofessionals/${defaultHealthProfessional.id}/`
                    .concat(`children/groups/${defaultChildrenGroup.id}`)

                return request
                    .patch(url)
                    .send({ children: new Array<string>('123') })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('DELETE /users/healthprofessionals/:healthprofessional_id/children/groups/group_id', () => {
        context('when the delete was successful', () => {
            it('should return status code 204 and no content', () => {
                const url = `/users/healthprofessionals/${defaultHealthProfessional.id}/`
                    .concat(`children/groups/${anotherChildrenGroup.id}`)

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
            it('should return status code 404 and info message for children group not found', () => {
                const url = `/users/healthprofessionals/${defaultHealthProfessional.id}/`
                    .concat(`children / groups /${new ObjectID()}`)

                return request
                    .delete(url)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the children group_id is invalid', () => {
            it('should return status code 400 and info message for invalid children group ID', () => {
                return request
                    .delete(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('GET /users/healthprofessionals/:healthprofessional_id/children/groups', () => {
        context('when want all children groups from educator', () => {
            it('should return status code 200 and a list of children groups', () => {
                return request
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an.instanceof(Array)
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('name')
                        expect(res.body[0].name).to.eql(defaultChildrenGroup.name)
                        expect(res.body[0]).to.have.property('children')
                        expect(res.body[0].children).is.an.instanceof(Array)
                        expect(res.body[0].children.length).to.eql(1)
                        expect(res.body[0]).to.have.property('school_class')
                        expect(res.body[0].school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })
        })

        context('when there no are children groups associated witn an user', () => {
            it('should return status code 200 and a empty array', () => {
                deleteAllChildrenGroups({}).then()

                return request
                    .get(`/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an.instanceof(Array)
                        expect(res.body.length).to.eql(0)
                    })

            })
        })
    })

    describe('GET /users/healthprofessionals', () => {
        context('when want get all health professionals in database', () => {
            it('should return status code 200 and a list of health professionals', () => {
                return request
                    .get('/users/healthprofessionals')
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
                    .get('/users/healthprofessionals')
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

async function createChildrenGroup(item) {
    return await ChildrenGroupRepoModel.create(item)
}

async function deleteAllChildrenGroups(doc) {
    return await ChildrenGroupRepoModel.deleteMany(doc)
}
