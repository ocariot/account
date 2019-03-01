import { Container } from 'inversify'
import { DI } from '../../../src/di/di'
import { IConnectionDB } from '../../../src/infrastructure/port/connection.db.interface'
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

const container: Container = DI.getInstance().getContainer()
const dbConnection: IConnectionDB = container.get(Identifier.MONGODB_CONNECTION)
const app: App = container.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Educator', () => {
    const institution: Institution = new Institution()

    const defaultEducator: Educator = new Educator()
    defaultEducator.username = 'educator'
    defaultEducator.password = 'mysecretkey'
    defaultEducator.institution = institution
    defaultEducator.type = UserType.EDUCATOR

    const defaultChild: Child = new Child()
    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
    const anotherChildrenGroup: ChildrenGroup = new ChildrenGroup()

    before(async () => {
            try {
                await dbConnection.tryConnect(0, 500)
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
                throw new Error('Failure on health professional test: ' + err.message)
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

    describe('POST /users/educators', () => {
        context('when posting a new educator user', () => {
            it('should return status code 201 and the saved educator', () => {
                const body = {
                    username: defaultEducator.username,
                    password: defaultEducator.password,
                    institution_id: institution.id
                }

                return request
                    .post('/users/educators')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultEducator.username)
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
                        defaultEducator.id = res.body.id
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and message info about duplicate items', () => {
                const body = {
                    username: defaultEducator.username,
                    password: defaultEducator.password,
                    institution_id: institution.id
                }

                return request
                    .post('/users/educators')
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
                    password: defaultEducator.password
                }

                return request
                    .post('/users/educators')
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
                    password: defaultEducator.password,
                    institution_id: new ObjectID()
                }

                return request
                    .post('/users/educators')
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
                    password: defaultEducator.password,
                    institution_id: '123'
                }

                return request
                    .post('/users/educators')
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

    describe('GET /users/educators/:educator_id', () => {
        context('when get a unique educator in database', () => {
            it('should return status code 200 and a educator', () => {
                return request
                    .get(`/users/educators/${defaultEducator.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultEducator.username)
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

        context('when the educator is not found', () => {
            it('should return status code 404 and info message from educator not found', () => {
                return request
                    .get(`/users/educators/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the educator_id is invalid', () => {
            it('should return status code 400 and message info about invalid id', () => {
                return request
                    .get('/users/educators/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('PATCH /users/educators/:educator_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and updated educator', () => {
                defaultEducator.username = 'newcoolusername'

                return request
                    .patch(`/users/educators/${defaultEducator.id}`)
                    .send({ username: 'newcoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(defaultEducator.id)
                        expect(res.body).to.have.property('username')
                        expect(res.body.username).to.eql(defaultEducator.username)
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
            it('should return status code 409 and info message from duplicate value', async () => {
                await createUser({
                    username: 'anothercoolusername',
                    password: defaultEducator.password,
                    type: UserType.EDUCATOR,
                    institution: institution.id,
                    scopes: new Array('users:read')
                }).then()

                return request
                    .patch(`/users/educators/${defaultEducator.id}`)
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
                    .patch(`/users/educators/${defaultEducator.id}`)
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
                    .patch(`/users/educators/${defaultEducator.id}`)
                    .send({ institution_id: '123' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the educator is not found', () => {
            it('should return status code 404 and info message from educator not found', () => {
                return request
                    .patch(`/users/educators/${new ObjectID()}`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the educator_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch('/users/educators/123')
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

    describe('POST /users/educators/:educator_id/children/groups', () => {
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
                    .post(`/users/educators/${defaultEducator.id}/children/groups`)
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
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0]).to.have.property('username')
                        expect(res.body.children[0].username).to.eql('anotherusername')
                        expect(res.body.children[0]).to.have.property('institution')
                        expect(res.body.children[0].institution).to.have.property('id')
                        expect(res.body.children[0].institution).to.have.property('type')
                        expect(res.body.children[0].institution.type).to.eql('Any Type')
                        expect(res.body.children[0].institution).to.have.property('name')
                        expect(res.body.children[0].institution.name).to.eql('Name Example')
                        expect(res.body.children[0].institution).to.have.property('address')
                        expect(res.body.children[0].institution.address).to.eql('221B Baker Street, St.')
                        expect(res.body.children[0].institution).to.have.property('latitude')
                        expect(res.body.children[0].institution.latitude).to.eql(0)
                        expect(res.body.children[0].institution).to.have.property('longitude')
                        expect(res.body.children[0].institution.longitude).to.eql(0)
                        expect(res.body.children[0]).to.have.property('age')
                        expect(res.body.children[0].age).to.eql(11)
                        expect(res.body.children[0]).to.have.property('gender')
                        expect(res.body.children[0].gender).to.eql('male')
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
                    .post(`/users/educators/${defaultEducator.id}/children/groups`)
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
                    .post(`/users/educators/${defaultEducator.id}/children/groups`)
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
                    .post(`/users/educators/${defaultEducator.id}/children/groups`)
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

    describe('GET /users/educators/:educator_id/children/groups/group_id', () => {
        context('when want get a unique children group', () => {
            it('should return status code 200 and a children group', () => {
                return request
                    .get(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('name')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body).to.have.property('children')
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).to.eql(1)
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0]).to.have.property('username')
                        expect(res.body.children[0].username).to.eql('anotherusername')
                        expect(res.body.children[0]).to.have.property('institution')
                        expect(res.body.children[0].institution).to.have.property('id')
                        expect(res.body.children[0].institution).to.have.property('type')
                        expect(res.body.children[0].institution.type).to.eql('Any Type')
                        expect(res.body.children[0].institution).to.have.property('name')
                        expect(res.body.children[0].institution.name).to.eql('Name Example')
                        expect(res.body.children[0].institution).to.have.property('address')
                        expect(res.body.children[0].institution.address).to.eql('221B Baker Street, St.')
                        expect(res.body.children[0].institution).to.have.property('latitude')
                        expect(res.body.children[0].institution.latitude).to.eql(0)
                        expect(res.body.children[0].institution).to.have.property('longitude')
                        expect(res.body.children[0].institution.longitude).to.eql(0)
                        expect(res.body.children[0]).to.have.property('age')
                        expect(res.body.children[0].age).to.eql(11)
                        expect(res.body.children[0]).to.have.property('gender')
                        expect(res.body.children[0].gender).to.eql('male')
                        expect(res.body).to.have.property('school_class')
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                        defaultChildrenGroup.id = res.body.id
                    })
            })
        })

        context('when the children group is not found', () => {
            it('should return status code 404 and info message from children group not found', () => {
                return request
                    .get(`/users/educators/${defaultEducator.id}/children/groups/${new ObjectID()}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when the children group_id is invalid', () => {
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .get(`/users/educators/${defaultEducator.id}/children/groups/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('PATCH /users/educators/:educator_id/children/groups/group_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and a updated children group', () => {
                defaultChildrenGroup.school_class = '5th Grade'

                return request
                    .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
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
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0]).to.have.property('username')
                        expect(res.body.children[0].username).to.eql('anotherusername')
                        expect(res.body.children[0]).to.have.property('institution')
                        expect(res.body.children[0].institution).to.have.property('id')
                        expect(res.body.children[0].institution).to.have.property('type')
                        expect(res.body.children[0].institution.type).to.eql('Any Type')
                        expect(res.body.children[0].institution).to.have.property('name')
                        expect(res.body.children[0].institution.name).to.eql('Name Example')
                        expect(res.body.children[0].institution).to.have.property('address')
                        expect(res.body.children[0].institution.address).to.eql('221B Baker Street, St.')
                        expect(res.body.children[0].institution).to.have.property('latitude')
                        expect(res.body.children[0].institution.latitude).to.eql(0)
                        expect(res.body.children[0].institution).to.have.property('longitude')
                        expect(res.body.children[0].institution.longitude).to.eql(0)
                        expect(res.body.children[0]).to.have.property('age')
                        expect(res.body.children[0].age).to.eql(11)
                        expect(res.body.children[0]).to.have.property('gender')
                        expect(res.body.children[0].gender).to.eql('male')
                        expect(res.body).to.have.property('school_class')
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                        defaultChildrenGroup.id = res.body.id
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and info message about duplicate items', async () => {
                await createChildrenGroup({
                    name: 'anothercoolname',
                    children: new Array<string | undefined>(defaultChild.id),
                    school_class: defaultChildrenGroup.school_class,
                    user_id: defaultEducator.id
                }).then(item => {
                    anotherChildrenGroup.id = item._id
                })

                return request
                    .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
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
                return request
                    .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
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
            it('should return status code 400 and info message from invalid id', () => {
                return request
                    .patch(`/users/educators/${defaultEducator.id}/children/groups/${defaultChildrenGroup.id}`)
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

    describe('DELETE /users/educators/:educator_id/children/groups/group_id', () => {
        context('when the delete was successful', () => {
            it('should return status code 204 and no content', () => {
                return request
                    .delete(`/users/educators/${defaultEducator.id}/children/groups/${anotherChildrenGroup.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the children group is not founded', () => {
            it('should return status code 404 and info message for children group not found', () => {
                return request
                    .delete(`/users/educators/${defaultEducator.id}/children/groups/${new ObjectID()}`)
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
                    .delete(`/users/educators/${defaultEducator.id}/children/groups/123}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })

    describe('GET  /users/educators/:educator_id/children/groups', () => {
        context('when want all children groups from educator', () => {
            it('should return status code 200 and a list of children groups', () => {
                return request
                    .get(`/users/educators/${defaultEducator.id}/children/groups`)
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
                        expect(res.body[0].children[0]).to.have.property('id')
                        expect(res.body[0].children[0]).to.have.property('username')
                        expect(res.body[0].children[0].username).to.eql('anotherusername')
                        expect(res.body[0].children[0]).to.have.property('institution')
                        expect(res.body[0].children[0].institution).to.have.property('id')
                        expect(res.body[0].children[0].institution).to.have.property('type')
                        expect(res.body[0].children[0].institution.type).to.eql('Any Type')
                        expect(res.body[0].children[0].institution).to.have.property('name')
                        expect(res.body[0].children[0].institution.name).to.eql('Name Example')
                        expect(res.body[0].children[0].institution).to.have.property('address')
                        expect(res.body[0].children[0].institution.address).to.eql('221B Baker Street, St.')
                        expect(res.body[0].children[0].institution).to.have.property('latitude')
                        expect(res.body[0].children[0].institution.latitude).to.eql(0)
                        expect(res.body[0].children[0].institution).to.have.property('longitude')
                        expect(res.body[0].children[0].institution.longitude).to.eql(0)
                        expect(res.body[0].children[0]).to.have.property('age')
                        expect(res.body[0].children[0].age).to.eql(11)
                        expect(res.body[0].children[0]).to.have.property('gender')
                        expect(res.body[0].children[0].gender).to.eql('male')
                        expect(res.body[0]).to.have.property('school_class')
                        expect(res.body[0].school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })
        })

        context('when there no are children groups associated witn an user', () => {
            it('should return status code 200 and a empty array', async () => {
                await deleteAllChildrenGroups({}).then()

                return request
                    .get(`/users/educators/${defaultEducator.id}/children/groups`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an.instanceof(Array)
                        expect(res.body.length).to.eql(0)
                    })

            })
        })
    })

    describe('GET /users/educators', () => {
        context('when want get all educators in database', () => {
            it('should return status code 200 and a list of educators', () => {
                return request
                    .get('/users/educators')
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
                    })
            })
        })

        context('when use query strings', () => {
            it('should return the result as required in query', async () => {
                await createInstitution({
                    type: 'University',
                    name: 'UEPB',
                    address: '221B Baker Street, St.',
                    latitude: 0,
                    longitude: 0
                }).then(result => {
                    createUser({
                        username: 'ihaveauniqueusername',
                        password: defaultEducator.password,
                        type: UserType.EDUCATOR,
                        institution: result._id,
                        scopes: new Array('users:read')
                    }).then()
                })

                const url: string = '/users/educators/?sort=username&fields=username,institution.name&' +
                    'institution.type=Any Type&page=1&limit=3'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution')
                        expect(res.body[0].institution).to.have.property('id')
                        expect(res.body[0].institution).to.have.property('name')
                        expect(res.body[0].institution).to.not.have.any.keys('address', 'type', 'latitude', 'longitude')
                        expect(res.body[0]).to.have.property('children_groups')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution')
                        expect(res.body[1].institution).to.not.have.any.keys('address', 'type', 'latitude', 'longitude')
                        expect(res.body[1].institution).to.have.property('id')
                        expect(res.body[1].institution).to.have.property('name')
                        expect(res.body[1]).to.have.property('children_groups')
                    })
            })
        })

        context('when there are no institutions in database', () => {
            it('should return status code 200 and a empty array', async () => {
                await deleteAllUsers({}).then()

                return request
                    .get('/users/educators')
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
