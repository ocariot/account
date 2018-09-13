import { User } from './../../../src/models/user'
import supertest from 'supertest'
import { expect } from 'chai'
import App from './../../../src/app'

var request: any

describe('Routes: Users', () => {
    const defaultUser = {
        _id: '5b13826de00324086854584a',
        name: 'Tristan J. Maya',
        age: 18,
        created_at: '2018-06-01T00:27:48.605Z'
    }

    before(() => {
        App.then((app) => request = supertest(app))
    })

    beforeEach(() => {
        User.remove({})
            .then(() => new User(defaultUser).save())
    })

    afterEach(() => { User.remove({}) })

    describe('GET /users', () => {
        it('should return a list of users', (done) => {
            request
                .get('/api/v1/users')
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    expect(res.statusCode).to.eql(200)
                    expect(res.body).to.eql([defaultUser])
                    done(err)
                })
        })

        context('when an id is specified', () => {
            it('should return status code 200 with one user', (done) => {
                request
                    .get(`/api/v1/users/${defaultUser._id}`)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(200)
                        expect(res.body).to.eql(defaultUser)
                        done(err)
                    })
            })

            it('should return to invalid ID, status code 400 and json with details', (done) => {
                request
                    .get(`/api/v1/users/0`)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(400)
                        expect(res.body).to.have.property('message')
                        done(err)
                    })
            })

            it('should return to user not found, status code 404 and json with details', (done) => {
                request
                    .get(`/api/v1/users/0b13826de00324086854584d`)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(404)
                        expect(res.body).to.have.property('message')
                        done(err)
                    })
            })
        })
    })

    describe('POST /users', () => {
        context('when posting an user', () => {
            it('should return a new user with status code 201', done => {
                let expectedSavedUser = {
                    _id: '5a62c0d6d6f33400146c9b65',
                    name: 'Mark',
                    age: 35,
                    created_at: defaultUser.created_at
                }

                let newUser = new User(expectedSavedUser)

                request
                    .post('/api/v1/users')
                    .send(newUser)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(201)
                        expect(res.body).to.eql(expectedSavedUser)
                        done(err)
                    })
            })

            it('should return status code 400 for missing or invalid parameters', done => {
                let expectedSavedUser = {
                    _id: '5a62c0d6d6f33400146c9b65',
                    age: 35,
                    created_at: defaultUser.created_at
                }

                let newUser = new User(expectedSavedUser)

                request
                    .post('/api/v1/users')
                    .send(newUser)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        expect(res.statusCode).to.eql(400)
                        expect(res.body).to.have.property('message')
                        expect(res.body).to.have.property('description')
                        done(err)
                    })
            })
        })
    })
})