import { DIContainer } from '../../../src/di/di'
import { IConnectionDB } from '../../../src/infrastructure/port/connection.db.interface'
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

const dbConnection: IConnectionDB = DIContainer.get(Identifier.MONGODB_CONNECTION)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: HealthProfessional', () => {
    const institution: Institution = new InstitutionMock()

    const defaultHealthProfessional: HealthProfessional = new HealthProfessionalMock()
    defaultHealthProfessional.password = 'health_professional_mock'
    defaultHealthProfessional.institution = institution

    const defaultChild: Child = new Child()
    const defaultChildrenGroup: ChildrenGroup = new ChildrenGroup()
    const anotherChildrenGroup: ChildrenGroup = new ChildrenGroup()

    before(async () => {
            try {
                await dbConnection.tryConnect(0, 500)
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
        } catch (err) {
            throw new Error('Failure on HealthProfessional test: ' + err.message)
        }
    })

    describe('POST /v1/users/healthprofessionals', () => {
        context('when posting a new health professional user', () => {
            it('should return status code 201 and the saved health professional', () => {
                const body = {
                    username: defaultHealthProfessional.username,
                    password: defaultHealthProfessional.password,
                    institution_id: institution.id
                }

                return request
                    .post('/v1/users/healthprofessionals')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(defaultHealthProfessional.username)
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
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
                    .post('/v1/users/healthprofessionals')
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
                    .post('/v1/users/healthprofessionals')
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Health Professional validation: username, password, ' +
                            'institution is required!')
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
                    .post('/v1/users/healthprofessionals')
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
                    .post('/v1/users/children')
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

    describe('GET /v1/users/healthprofessionals/:healthprofessional_id', () => {
        context('when get a unique health professional in database', () => {
            it('should return status code 200 and a health professional', () => {
                return request
                    .get(`/v1/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultHealthProfessional.id)
                        expect(res.body.username).to.eql(defaultHealthProfessional.username)
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
                    })
            })
        })

        context('when the health professional is not found', () => {
            it('should return status code 404 and info message from health professional not found', () => {
                return request
                    .get(`/v1/users/healthprofessionals/${new ObjectID()}`)
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
                    .get('/v1/users/healthprofessionals/123')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('PATCH /v1/users/healthprofessionals/:healthprofessional_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and updated health professional', () => {
                defaultHealthProfessional.username = 'newcoolusername'

                return request
                    .patch(`/v1/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ username: 'newcoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(defaultHealthProfessional.id)
                        expect(res.body.username).to.eql(defaultHealthProfessional.username)
                        expect(res.body.institution_id).to.eql(institution.id!.toString())
                    })
            })
        })

        context('when a duplication error occurs', () => {
            it('should return status code 409 and info message from duplicate value', async () => {
                try {
                    await createUser({
                        username: 'anothercoolusername',
                        password: defaultHealthProfessional.password,
                        type: UserType.HEALTH_PROFESSIONAL,
                        institution: institution.id,
                        scopes: new Array('users:read')
                    }).then()
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }

                return request
                    .patch(`/v1/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ username: 'anothercoolusername' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql('Health Professional is already registered!')
                    })
            })
        })

        context('when the institution provided does not exists', () => {
            it('should return status code 400 and message for institution not found', () => {
                return request
                    .patch(`/v1/users/healthprofessionals/${defaultHealthProfessional.id}`)
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
                    .patch(`/v1/users/healthprofessionals/${defaultHealthProfessional.id}`)
                    .send({ institution_id: '123' })
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the health professional is not found', () => {
            it('should return status code 404 and info message from health professional not found', () => {
                return request
                    .patch(`/v1/users/healthprofessionals/${new ObjectID()}`)
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
                    .patch('/v1/users/healthprofessionals/123')
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

    describe('POST /v1/users/healthprofessionals/:healthprofessional_id/children/groups', () => {
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
                    .post(`/v1/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(body.name)
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).to.eql(1)
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0].username).to.eql('anotherusername')
                        expect(res.body.children[0].institution_id).to.eql(institution.id!.toString())
                        expect(res.body.school_class).to.eql(body.school_class)
                        defaultChildrenGroup.id = res.body.id
                        defaultChildrenGroup.children = res.body.children
                    })
            })
        })

        context('when there are validation errors', () => {
            it('should return status code 400 and info message from invalid or missing parameters', () => {
                return request
                    .post(`/v1/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Children Group validation: name, Collection with ' +
                            'children IDs is required!')
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
                    .post(`/v1/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
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
            it('should return status code 400 and info message from invalid ID', () => {
                const body = {
                    name: 'Children Group Two',
                    children: new Array<string | undefined>('507f1f77bcf86cd799439011'),
                    school_class: '3th Grade'
                }

                return request
                    .post(`/v1/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
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

    describe('GET /v1/users/healthprofessionals/:healthprofessional_id/children/groups/:group_id', () => {
        context('when want get a unique children group', () => {
            it('should return status code 200 and a children group', () => {
                const url = `/v1/users/healthprofessionals/${defaultHealthProfessional.id}/`
                    .concat(`children/groups/${defaultChildrenGroup.id}`)

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).to.eql(1)
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0].username).to.eql('anotherusername')
                        expect(res.body.children[0].institution_id).to.eql(institution.id!.toString())
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                        defaultChildrenGroup.id = res.body.id
                    })
            })
        })

        context('when the children group is not found', () => {
            it('should return status code 404 and info message from children group not found', () => {
                const url = `/v1/users/healthprofessionals/${defaultHealthProfessional.id}/`
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
                    .get(`/v1/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('PATCH /v1/users/healthprofessionals/:healthprofessional_id/children/groups/:group_id', () => {
        context('when the update was successful', () => {
            it('should return status code 200 and a updated children group', () => {
                defaultChildrenGroup.school_class = '5th Grade'

                const url = `/v1/users/healthprofessionals/${defaultHealthProfessional.id}/`
                    .concat(`children/groups/${defaultChildrenGroup.id}`)

                return request
                    .patch(url)
                    .send({ school_class: defaultChildrenGroup.school_class })
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(defaultChildrenGroup.name)
                        expect(res.body.children).is.an.instanceof(Array)
                        expect(res.body.children.length).to.eql(1)
                        expect(res.body.children[0]).to.have.property('id')
                        expect(res.body.children[0].username).to.eql('anotherusername')
                        expect(res.body.children[0].institution_id).to.eql(institution.id!.toString())
                        expect(res.body.school_class).to.eql(defaultChildrenGroup.school_class)
                        defaultChildrenGroup.id = res.body.id
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and info message from duplicate items', async () => {
                try {
                    await createChildrenGroup({
                        name: 'anothercoolname',
                        children: new Array<string | undefined>(defaultChild.id),
                        school_class: defaultChildrenGroup.school_class,
                        user_id: defaultHealthProfessional.id
                    }).then(item => {
                        anotherChildrenGroup.id = item._id
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }

                const url = `/v1/users/healthprofessionals/${defaultHealthProfessional.id}/`
                    .concat(`children/groups/${defaultChildrenGroup.id}`)

                return request
                    .patch(url)
                    .send({ name: 'anothercoolname' })
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.message).to.eql('Children Group is already registered!')
                    })
            })
        })

        context('when the children group was updated with a not existent child id', () => {
            it('should return status code 400 and info message for invalid child id', () => {
                const url = `/v1/users/healthprofessionals/${defaultHealthProfessional.id}/`
                    .concat(`children/groups/${defaultChildrenGroup.id}`)

                return request
                    .patch(url)
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
            it('should return status code 400 and info message from invalid ID.', () => {
                const url = `/v1/users/healthprofessionals/${defaultHealthProfessional.id}/`
                    .concat(`children/groups/${defaultChildrenGroup.id}`)

                return request
                    .patch(url)
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

    describe('DELETE /v1/users/healthprofessionals/:healthprofessional_id/children/groups/:group_id', () => {
        context('when the delete was successful', () => {
            it('should return status code 204 and no content', () => {
                const url = `/v1/users/healthprofessionals/${defaultHealthProfessional.id}/`
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
                const url = `/v1/users/healthprofessionals/${defaultHealthProfessional.id}/`
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
                    .delete(`/v1/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('GET /v1/users/healthprofessionals/:healthprofessional_id/children/groups', () => {
        context('when want all children groups from healthprofessional', () => {
            it('should return status code 200 and a list of children groups', () => {
                return request
                    .get(`/v1/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an.instanceof(Array)
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].name).to.eql(defaultChildrenGroup.name)
                        expect(res.body[0].children).is.an.instanceof(Array)
                        expect(res.body[0].children.length).to.eql(1)
                        expect(res.body[0].children[0]).to.have.property('id')
                        expect(res.body[0].children[0].username).to.eql('anotherusername')
                        expect(res.body[0].children[0].institution_id).to.eql(institution.id!.toString())
                        expect(res.body[0].school_class).to.eql(defaultChildrenGroup.school_class)
                    })
            })
        })

        context('when there no are children groups associated witn an user', () => {
            it('should return status code 200 and a empty array', async () => {
                try {
                    await deleteAllChildrenGroups().then()
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }

                return request
                    .get(`/v1/users/healthprofessionals/${defaultHealthProfessional.id}/children/groups`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.be.an.instanceof(Array)
                        expect(res.body.length).to.eql(0)
                    })

            })
        })
    })

    describe('GET /v1/users/healthprofessionals', () => {
        context('when want get all health professionals in database', () => {
            it('should return status code 200 and a list of health professionals', () => {
                return request
                    .get('/v1/users/healthprofessionals')
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
                            username: 'ihaveauniqueusername',
                            password: defaultHealthProfessional.password,
                            type: UserType.HEALTH_PROFESSIONAL,
                            institution: result._id,
                            scopes: new Array('users:read')
                        }).then()
                    })
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }

                const url: string = '/v1/users/healthprofessionals?sort=username&page=1&limit=3'

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
                        expect(res.body[0]).to.have.property('children_groups')
                        expect(res.body[1]).to.have.property('id')
                        expect(res.body[1]).to.have.property('username')
                        expect(res.body[1]).to.have.property('institution_id')
                        expect(res.body[1]).to.have.property('children_groups')
                    })
            })
        })

        context('when there are no institutions in database', () => {
            it('should return status code 200 and a empty array', async () => {
                try {
                    await deleteAllUsers().then()
                } catch (err) {
                    throw new Error('Failure on HealthProfessional test: ' + err.message)
                }

                return request
                    .get('/v1/users/healthprofessionals')
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

async function createChildrenGroup(item) {
    return await ChildrenGroupRepoModel.create(item)
}

async function deleteAllChildrenGroups() {
    return await ChildrenGroupRepoModel.deleteMany({})
}
