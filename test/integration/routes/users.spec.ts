import { User } from './../../../src/models/user'
import supertest from 'supertest'
import { expect } from 'chai'
import App from './../../../src/app'
import { ObjectID } from 'bson';
import { userInfo } from 'os';

var request: any

describe('Routes: Users', () => {

    const defaultUser: any = {
        "id": "",
        "user_name": "br-schoolA-studentB",
        "password": "lorem123",
        "school": {
            "name": "Unifor",
            "country": "BR",
            "city": "Fortaleza",
            "address": "Av. Washington Soares, 1321 - Edson Queiroz, Fortaleza - CE, 60811-905"
        }
    }

    before(()  => request = supertest(App.getExpress()))

    after(() => User.deleteMany({}))

    describe('POST /users', () => {
        context('when posting a new user', () => {
            it('should return status code 201 and saved user', () => {

                return request
                    .post('/api/v1/users')
                    .send(defaultUser)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then((res) => {
                        expect(res.statusCode).to.eql(201)
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('user_name')
                        expect(res.body.name).to.eql(defaultUser.name)
                        expect(res.body).to.have.property('school')
                        expect(res.body.school.name).to.eql(defaultUser.school.name)
                        expect(res.body.school.country).to.eql(defaultUser.school.country)
                        expect(res.body.school.city).to.eql(defaultUser.school.city)
                        expect(res.body.school.address).to.eql(defaultUser.school.address)
                        expect(res.body).to.have.property('created_at')
                        defaultUser.id = res.body.id
                    })
            })
        })

        context('when there are missing or invalid parameters in request', () => {
            it('should return status code 400 and info message from invalid parameters', () => {

                const userWithWrongParameter: any = {
                    "user_name": "Incomplete Example",
                    "password": "123",
                    "school": "UEPB"
                }

                return request
                    .post('/api/v1/users')
                    .send(userWithWrongParameter)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })

            it('should return status code 400 and info message from missing parameters', () => {

                const incompleteUser: any = {
                    "user_name": "Incomplete Example",
                    "password": "123"
                }

                return request
                    .post('/api/v1/users')
                    .send(incompleteUser)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when user already exists', () => {
            it('should return status code 409 and info message from duplicate data', () => {

                return request
                    .post('/api/v1/users/')
                    .send(defaultUser)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                    })
            })
        })
    })

    describe('GET /users', () => {
        it('should return status code 200 and a list of users', () => {

            return request
                .get('/api/v1/users')
                .set('Content-Type', 'application/json')
                .then(res => {
                    expect(res.body).to.have.lengthOf(1)
                    expect(res.body[0]).to.have.property('id')
                    expect(res.body[0]).to.have.property('user_name')
                    expect(res.body[0].name).to.eql(defaultUser.name)
                    expect(res.body[0]).to.have.property('school')
                    expect(res.body[0].school.name).to.eql(defaultUser.school.name)
                    expect(res.body[0].school.country).to.eql(defaultUser.school.country)
                    expect(res.body[0].school.city).to.eql(defaultUser.school.city)
                    expect(res.body[0].school.address).to.eql(defaultUser.school.address)
                    expect(res.body[0]).to.have.property('created_at')
                })
        })
    })

    describe('POST /users/auth', () => {
        it('should return a token when auth is successfully', () => {

            return request
                .post('/api/v1/users/auth')
                .send({
                    user_name: defaultUser.user_name,
                    password: defaultUser.password
                })
                .set('Content-Type', 'application/json')
                .expect(201)
                .then(res => {
                    expect(res.body).is.not.null
                    expect(res.body).to.have.property('access_token')
                })
        })

        context('when there are no user with authenticate parameters', () => {
            it('should return status code 404 and info message from user not found', () => {

                return request
                    .post('/api/v1/users/auth')
                    .send({
                        user_name: 'anyone',
                        password: 'anyone'
                    })
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })

        context('when there are missing parameters in request', () => {
            it('should return status code 400 and info message from missing parameters', () => {

                return request
                    .post('/api/v1/users/auth')
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

    describe('GET /users/:user_id', () => {
        it('should return status code 200 and a unique user', () => {

            return request
                .get(`/api/v1/users/${defaultUser.id}`)
                .set('Content-Type', 'application/json')
                .expect(200)
                .then(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body).to.have.property('user_name')
                    expect(res.body.name).to.eql(defaultUser.name)
                    expect(res.body).to.have.property('school')
                    expect(res.body.school.name).to.eql(defaultUser.school.name)
                    expect(res.body.school.country).to.eql(defaultUser.school.country)
                    expect(res.body.school.city).to.eql(defaultUser.school.city)
                    expect(res.body.school.address).to.eql(defaultUser.school.address)
                    expect(res.body).to.have.property('created_at')
                })
        })

        context('when there are no user with id parameter', () => {
            it('should return status code 404 and info message from user not found', () => {

                const randomId: any = new ObjectID()

                return request
                    .get(`/api/v1/users/${randomId}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                    })
            })
        })

        context('when there are invalid parameters in request', () => {
            it('should return status code 400 and info about invalid user id', () => {

                const invalidId: string = '1a2b3c'

                return request
                    .get(`/api/v1/users/${invalidId}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('message')
                        expect(err.body).to.have.property('description')
                    })
            })
        })
    })
})

async function createUser(user) {
    await User.create(user)
}

async function deleteAll() {
    await User.deleteMany({})
}