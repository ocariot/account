import { DIContainer } from '../../../src/di/di'
import { IConnectionDB } from '../../../src/infrastructure/port/connection.db.interface'
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
import { FamilyMock } from '../../mocks/family.mock'
import { InstitutionMock } from '../../mocks/institution.mock'
import { ChildMock } from '../../mocks/child.mock'
import { Strings } from '../../../src/utils/strings'

const dbConnection: IConnectionDB = DIContainer.get(Identifier.MONGODB_CONNECTION)
const childService: IChildService = DIContainer.get(Identifier.CHILD_SERVICE)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Family', () => {
    const institution: Institution = new InstitutionMock()

    const defaultFamily: Family = new FamilyMock()
    defaultFamily.password = 'family_password'
    defaultFamily.institution = institution

    const child = new ChildMock()
    child.username = 'anothercoolusername'
    child.password = 'child_password'
    child.gender = 'male'
    child.age = 11
    child.type = UserType.CHILD
    child.institution = institution

    const anotherChild = new Child()

    before(async () => {
            try {
                await dbConnection.tryConnect(0, 500)
                await deleteAllUsers()
                await deleteAllInstitutions()

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
                throw new Error('Failure on Family test: ' + err.message)
            }
        }
    )

    after(async () => {
        try {
            await deleteAllUsers()
            await deleteAllInstitutions()
            await dbConnection.dispose()
        } catch (err) {
            throw new Error('Failure on Family test: ' + err.message)
        }
    })

    describe('POST /v1/families', () => {
        context('when posting a new family user', () => {
            it('should return status code 201 and the saved family', () => {
                const body = {
                    username: defaultFamily.username,
                    password: defaultFamily.password,
                    children: [child.id],
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
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
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
                const body = {
                }

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
            it('should return status code 400 and message for institution not found', () => {
                const body = {
                    username: 'anotherusername',
                    password: defaultFamily.password,
                    children: [child.id],
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
                    children: [child.id],
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
        context('when get a unique family in database', () => {
            it('should return status code 200 and a family', () => {
                return request
                    .get(`/v1/families/${defaultFamily.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultFamily.id)
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).is.eql(1)
                    })
            })
        })

        context('when the family is not found', () => {
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
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('PATCH /v1/families/:family_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and updated family', () => {
                return request
                    .patch(`/v1/families/${defaultFamily.id}`)
                    .send({ last_login: defaultFamily.last_login })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultFamily.id)
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).is.eql(1)
                        expect(res.body.last_login).to.eql(defaultFamily.last_login!.toISOString())
                    })
            })
        })

        context('when a duplication error occurs', () => {
            it('should return status code 409 and info message from duplicate value', async () => {
                try {
                    await createUser({
                        username: 'acoolusername',
                        password: defaultFamily.password,
                        type: UserType.FAMILY,
                        institution: institution.id,
                        scopes: new Array('users:read')
                    }).then()
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }

                return request
                    .patch(`/v1/families/${defaultFamily.id}`)
                    .send({ username: 'acoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql('Family is already registered!')
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

                return request
                    .post(`/v1/families/${defaultFamily.id}/children/${anotherChild.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultFamily.id)
                        expect(res.body.username).to.eql(defaultFamily.username)
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).is.eql(2)
                    })
            })
        })

        context('when the child id does not exists', () => {
            it('should return status code 400 and info message from invalid child ID', () => {
                return request
                    .post(`/v1/families/${defaultFamily.id}/children/${new ObjectID()}`)
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
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('DELETE /v1/families/:family_id/children/:child_id', () => {
        context('when want disassociate a child from a family', () => {
            it('should return status code 204 and no content', () => {
                return request
                    .delete(`/v1/families/${defaultFamily.id}/children/${anotherChild.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the child id does not exists', () => {
            it('should return status code 204 and no content, even the child id does not exists', () => {
                return request
                    .delete(`/v1/families/${defaultFamily.id}/children/${new ObjectID()}`)
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
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('GET /v1/families/:family_id/children', () => {
        context('when want get all children from family', () => {
            it('should return status code 200 and the family children', () => {
                return request
                    .get(`/v1/families/${defaultFamily.id}/children`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceof(Array)
                        expect(res.body.length).is.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].username).to.eql('anothercoolusername')
                        expect(res.body[0].institution_id).to.eql(institution.id!.toString())
                        expect(res.body[0].age).to.eql(11)
                        expect(res.body[0].gender).to.eql('male')
                    })
            })
        })

        context('when there no are children groups associated with an user', () => {
            it('should return status code 200 and empty array', async () => {
                try {
                    await deleteAllChildrenFromFamily(defaultFamily.id)
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }

                request
                    .get(`/v1/families/${defaultFamily.id}/children`)
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
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('GET /v1/families', () => {
        context('when want get all families in database', () => {
            it('should return status code 200 and a list of users', () => {
                return request
                    .get('/v1/families')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(2)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution_id')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution_id')
                        expect(res.body[1]).to.have.property('last_login')
                    })
            })
        })

        context('when use query strings', () => {
            it('should return the result as required in query', async () => {
                try {
                    await createInstitution({
                        type: 'University',
                        name: 'UEPB',
                        address: '221B Baker Street, St.',
                        latitude: 0,
                        longitude: 0
                    }).then(result => {
                        createUser({
                            username: 'myusernameisunique',
                            password: defaultFamily.password,
                            type: UserType.FAMILY,
                            institution: result._id,
                            scopes: new Array('users:read'),
                            last_login: defaultFamily.last_login
                        }).then()
                    })
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }

                const url: string = '/v1/families?sort=username&page=1&limit=3'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(3)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('username')
                        expect(res.body[0]).to.have.property('institution_id')
                        expect(res.body[0]).to.have.property('children')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution_id')
                        expect(res.body[1]).to.have.property('children')
                    })
            })
        })

        context('when there are no institutions in database', () => {
            it('should return status code 200 and a empty array', async () => {
                try {
                    await deleteAllUsers().then()
                } catch (err) {
                    throw new Error('Failure on Family test: ' + err.message)
                }

                return request
                    .get('/v1/families')
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

async function deleteAllUsers() {
    return await UserRepoModel.deleteMany({})
}

async function createInstitution(item) {
    return await InstitutionRepoModel.create(item)
}

async function deleteAllInstitutions() {
    return await InstitutionRepoModel.deleteMany({})
}

async function deleteAllChildrenFromFamily(id) {
    return await UserRepoModel.updateOne({ _id: id }, { $set: { children: [] } })
}
