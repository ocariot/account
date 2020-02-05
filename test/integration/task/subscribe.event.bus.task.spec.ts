import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { IBackgroundTask } from '../../../src/application/port/background.task.interface'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { Default } from '../../../src/utils/default'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { IChildRepository } from '../../../src/application/port/child.repository.interface'
import { IQuery } from '../../../src/application/port/query.interface'
import { Child, FitbitStatus } from '../../../src/application/domain/model/child'
import { ChildMock } from '../../mocks/child.mock'
import { UserType } from '../../../src/application/domain/model/user'
import { Strings } from '../../../src/utils/strings'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const subscribeEventBusTask: IBackgroundTask = DIContainer.get(Identifier.SUB_EVENT_BUS_TASK)
const childRepository: IChildRepository = DIContainer.get(Identifier.CHILD_REPOSITORY)

describe('SUBSCRIBE EVENT BUS TASK', () => {
    // Timeout function for control of execution
    const timeout = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    // Start DB connection, RabbitMQ connection and SubscribeEventBusTask
    before(async () => {
        try {
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

            await deleteAllInstitutions()
            await deleteAllUsers()

            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })

            subscribeEventBusTask.run()

            await timeout(2000)
        } catch (err) {
            throw new Error('Failure on SubscribeEventBusTask test: ' + err.message)
        }
    })

    // Stop DB connection and SubscribeEventBusTask
    after(async () => {
        try {
            await deleteAllInstitutions()
            await deleteAllUsers()

            await dbConnection.dispose()

            await subscribeEventBusTask.stop()
        } catch (err) {
            throw new Error('Failure on SubscribeEventBusTask test: ' + err.message)
        }
    })

    /**
     * SUBSCRIBERS
     */
    describe('SUBSCRIBE FitbitLastSyncEvent', () => {
        before(async () => {
            try {
                await deleteAllInstitutions()
                await deleteAllUsers()
            } catch (err) {
                throw new Error('Failure on Subscribe FitbitLastSyncEvent test: ' + err.message)
            }
        })
        // Delete all activities from database after each test case
        afterEach(async () => {
            try {
                await deleteAllInstitutions()
                await deleteAllUsers()
            } catch (err) {
                throw new Error('Failure on Subscribe FitbitLastSyncEvent test: ' + err.message)
            }
        })

        context('when receiving a FitbitLastSyncEvent successfully', () => {
            it('should return an updated child with a nesw last_sync', (done) => {
                const child: Child = new ChildMock()
                child.last_sync = new Date('2020-01-25T14:40:00Z')

                childRepository.create(child)
                    .then(async childCreate => {
                        const fitbitLastSync: any = { child_id: childCreate.id, last_sync: '2020-02-05T10:30:00Z' }
                        await rabbitmq.bus.pubFitbitLastSync(fitbitLastSync)

                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const query: IQuery = new Query()
                        query.addFilter({ _id: childCreate.id, type: UserType.CHILD })

                        const result = await childRepository.findOne(query)
                        expect(result.last_sync).to.eql(new Date(fitbitLastSync.last_sync))
                        expect(result.fitbit_status).to.eql(FitbitStatus.VALID_TOKEN)

                        done()
                    })
                    .catch(done)
            })
        })

        context('when receiving a FitbitLastSyncEvent with an invalid fitbit parameter (invalid child_id))', () => {
            it('should print a log referring to the wrong "fitbit" format, in this case the child_id that is not in the ' +
                'correct format', (done) => {
                const fitbitLastSync: any = { child_id: '5d7fb75ae48591c21a793f701',    // Invalid child_id
                    last_sync: '2018-11-19T14:40:00' }
                rabbitmq.bus.pubFitbitLastSync(fitbitLastSync)
                    .then(async () => {
                        await timeout(2000)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when receiving a FitbitLastSyncEvent with an invalid fitbit parameter (invalid last_sync))', () => {
            it('should print a log referring to the wrong "fitbit" format, in this case the last_sync that is not in the ' +
                'correct format', (done) => {
                const fitbitLastSync: any = { child_id: '5d7fb75ae48591c21a793f70',
                    last_sync: '2018-111-19T14:40:00' }    // Invalid last_sync
                rabbitmq.bus.pubFitbitLastSync(fitbitLastSync)
                    .then(async () => {
                        await timeout(2000)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when receiving a FitbitLastSyncEvent successfully (without MongoDB connection, at first)', () => {
            it('should return an updated child with a new last_sync', (done) => {
                const child: Child = new ChildMock()
                childRepository.create(child)
                    .then(async childCreate => {
                        const fitbitLastSync: any = { child_id: childCreate.id, last_sync: '2018-11-19T14:40:00' }
                        await dbConnection.dispose()
                        await rabbitmq.bus.pubFitbitLastSync(fitbitLastSync)

                        await timeout(1000)

                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

                        await timeout(2000)

                        const query: IQuery = new Query()
                        query.addFilter({ _id: childCreate.id, type: UserType.CHILD })

                        const result = await childRepository.findOne(query)
                        expect(result.last_sync).to.eql(new Date(fitbitLastSync.last_sync))

                        done()
                    })
                    .catch(done)
            })
        })
    })

    describe('SUBSCRIBE FitbitAuthErrorEvent', () => {
        before(async () => {
            try {
                await deleteAllInstitutions()
                await deleteAllUsers()
            } catch (err) {
                throw new Error('Failure on Subscribe FitbitAuthErrorEvent test: ' + err.message)
            }
        })
        // Delete all activities from database after each test case
        afterEach(async () => {
            try {
                await deleteAllInstitutions()
                await deleteAllUsers()
            } catch (err) {
                throw new Error('Failure on Subscribe FitbitAuthErrorEvent test: ' + err.message)
            }
        })

        context('when receiving a FitbitAuthErrorEvent successfully', () => {
            it('should return an updated child with a new fitbit_status (expired_token)', (done) => {
                const child: Child = new ChildMock()

                childRepository.create(child)
                    .then(async childCreate => {
                        const fitbitAuthError: any = { child_id: childCreate.id,
                            error: {
                                code: 1011, message: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
                                description: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR_DESC
                            } }
                        await rabbitmq.bus.pubFitbitAuthError(fitbitAuthError)

                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const query: IQuery = new Query()
                        query.addFilter({ _id: childCreate.id, type: UserType.CHILD })

                        const result = await childRepository.findOne(query)
                        expect(result.fitbit_status).to.eql(FitbitStatus.EXPIRED_TOKEN)

                        done()
                    })
                    .catch(done)
            })

            it('should return an updated child with a new fitbit_status (invalid_token)', (done) => {
                const child: Child = new ChildMock()

                childRepository.create(child)
                    .then(async childCreate => {
                        const fitbitAuthError: any = { child_id: childCreate.id,
                            error: {
                                code: 1012, message: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
                                description: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR_DESC
                            } }
                        await rabbitmq.bus.pubFitbitAuthError(fitbitAuthError)

                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const query: IQuery = new Query()
                        query.addFilter({ _id: childCreate.id, type: UserType.CHILD })

                        const result = await childRepository.findOne(query)
                        expect(result.fitbit_status).to.eql(FitbitStatus.INVALID_TOKEN)

                        done()
                    })
                    .catch(done)
            })

            it('should return an updated child with a new fitbit_status (invalid_grant)', (done) => {
                const child: Child = new ChildMock()

                childRepository.create(child)
                    .then(async childCreate => {
                        const fitbitAuthError: any = { child_id: childCreate.id,
                            error: {
                                code: 1021, message: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
                                description: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR_DESC
                            } }
                        await rabbitmq.bus.pubFitbitAuthError(fitbitAuthError)

                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const query: IQuery = new Query()
                        query.addFilter({ _id: childCreate.id, type: UserType.CHILD })

                        const result = await childRepository.findOne(query)
                        expect(result.fitbit_status).to.eql(FitbitStatus.INVALID_GRANT)

                        done()
                    })
                    .catch(done)
            })

            it('should return an updated child with a new fitbit_status (invalid_client)', (done) => {
                const child: Child = new ChildMock()

                childRepository.create(child)
                    .then(async childCreate => {
                        const fitbitAuthError: any = { child_id: childCreate.id,
                            error: {
                                code: 1401, message: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
                                description: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR_DESC
                            } }
                        await rabbitmq.bus.pubFitbitAuthError(fitbitAuthError)

                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const query: IQuery = new Query()
                        query.addFilter({ _id: childCreate.id, type: UserType.CHILD })

                        const result = await childRepository.findOne(query)
                        expect(result.fitbit_status).to.eql(FitbitStatus.INVALID_CLIENT)

                        done()
                    })
                    .catch(done)
            })

            it('should return an updated child with a new fitbit_status (system)', (done) => {
                const child: Child = new ChildMock()

                childRepository.create(child)
                    .then(async childCreate => {
                        const fitbitAuthError: any = { child_id: childCreate.id,
                            error: {
                                code: 1429, message: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
                                description: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR_DESC
                            } }
                        await rabbitmq.bus.pubFitbitAuthError(fitbitAuthError)

                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const query: IQuery = new Query()
                        query.addFilter({ _id: childCreate.id, type: UserType.CHILD })

                        const result = await childRepository.findOne(query)
                        expect(result.fitbit_status).to.eql(FitbitStatus.SYSTEM)

                        done()
                    })
                    .catch(done)
            })

            it('should return an updated child with a new fitbit_status (other)', (done) => {
                const child: Child = new ChildMock()

                childRepository.create(child)
                    .then(async childCreate => {
                        const fitbitAuthError: any = { child_id: childCreate.id,
                            error: {
                                code: 1500, message: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
                                description: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR_DESC
                            } }
                        await rabbitmq.bus.pubFitbitAuthError(fitbitAuthError)

                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const query: IQuery = new Query()
                        query.addFilter({ _id: childCreate.id, type: UserType.CHILD })

                        const result = await childRepository.findOne(query)
                        expect(result.fitbit_status).to.eql(FitbitStatus.NONE)

                        done()
                    })
                    .catch(done)
            })
        })

        context('when receiving a FitbitAuthErrorEvent with an invalid fitbit parameter (invalid child_id))', () => {
            it('should print a log referring to the wrong "fitbit" format, in this case the child_id that is not in the ' +
                'correct format', (done) => {
                const fitbitAuthError: any = { child_id: '5d7fb75ae48591c21a793f701',    // Invalid child_id
                    error: {
                        code: 1011, message: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
                        description: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR_DESC
                    } }
                rabbitmq.bus.pubFitbitAuthError(fitbitAuthError)
                    .then(async () => {
                        await timeout(2000)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when receiving a FitbitAuthErrorEvent successfully (without MongoDB connection, at first)', () => {
            it('should return an updated child with a new fitbit_status', (done) => {
                const child: Child = new ChildMock()
                childRepository.create(child)
                    .then(async childCreate => {
                        const fitbitAuthError: any = { child_id: childCreate.id,
                            error: {
                                code: 1011, message: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
                                description: Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR_DESC
                            } }
                        await dbConnection.dispose()
                        await rabbitmq.bus.pubFitbitAuthError(fitbitAuthError)

                        await timeout(1000)

                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

                        await timeout(2000)

                        const query: IQuery = new Query()
                        query.addFilter({ _id: childCreate.id, type: UserType.CHILD })

                        const result = await childRepository.findOne(query)
                        expect(result.fitbit_status).to.eql(FitbitStatus.EXPIRED_TOKEN)

                        done()
                    })
                    .catch(done)
            })
        })
    })

    describe('SUBSCRIBE FitbitRevokeEvent', () => {
        before(async () => {
            try {
                await deleteAllInstitutions()
                await deleteAllUsers()
            } catch (err) {
                throw new Error('Failure on Subscribe FitbitRevokeEvent test: ' + err.message)
            }
        })
        // Delete all activities from database after each test case
        afterEach(async () => {
            try {
                await deleteAllInstitutions()
                await deleteAllUsers()
            } catch (err) {
                throw new Error('Failure on Subscribe FitbitRevokeEvent test: ' + err.message)
            }
        })

        context('when receiving a FitbitRevokeEvent successfully', () => {
            it('should return an updated child with a new fitbit_status (none)', (done) => {
                const child: Child = new ChildMock()
                child.fitbit_status = FitbitStatus.VALID_TOKEN

                childRepository.create(child)
                    .then(async childCreate => {
                        const fitbitRevoke: any = { child_id: childCreate.id }
                        await rabbitmq.bus.pubFitbitRevoke(fitbitRevoke)

                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const query: IQuery = new Query()
                        query.addFilter({ _id: childCreate.id, type: UserType.CHILD })

                        const result = await childRepository.findOne(query)
                        expect(result.fitbit_status).to.eql(FitbitStatus.NONE)

                        done()
                    })
                    .catch(done)
            })
        })

        context('when receiving a FitbitRevokeEvent with an invalid fitbit parameter (invalid child_id))', () => {
            it('should print a log referring to the wrong "fitbit" format, in this case the child_id that is not in the ' +
                'correct format', (done) => {
                const fitbitRevoke: any = { child_id: '5d7fb75ae48591c21a793f701'}
                rabbitmq.bus.pubFitbitRevoke(fitbitRevoke)
                    .then(async () => {
                        await timeout(2000)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when receiving a FitbitRevokeEvent successfully (without MongoDB connection, at first)', () => {
            it('should return an updated child with a new fitbit_status', (done) => {
                const child: Child = new ChildMock()
                childRepository.create(child)
                    .then(async childCreate => {
                        const fitbitRevoke: any = { child_id: childCreate.id }
                        await dbConnection.dispose()
                        await rabbitmq.bus.pubFitbitRevoke(fitbitRevoke)

                        await timeout(1000)

                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

                        await timeout(2000)

                        const query: IQuery = new Query()
                        query.addFilter({ _id: childCreate.id, type: UserType.CHILD })

                        const result = await childRepository.findOne(query)
                        expect(result.fitbit_status).to.eql(FitbitStatus.NONE)

                        done()
                    })
                    .catch(done)
            })
        })
    })
})

async function deleteAllUsers() {
    return UserRepoModel.deleteMany({})
}

async function deleteAllInstitutions() {
    return InstitutionRepoModel.deleteMany({})
}
