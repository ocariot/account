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
import { Child } from '../../../src/application/domain/model/child'
import { ChildMock } from '../../mocks/child.mock'
import { UserType } from '../../../src/application/domain/model/user'

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
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                { interval: 100 })

            await deleteAllInstitutions()
            await deleteAllUsers()

            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })

            await subscribeEventBusTask.run()
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

        context('when posting a FitbitLastSyncEvent successfully', () => {
            it('should return an updated child with a new last_sync', (done) => {
                const child: Child = new ChildMock()
                child.last_login = undefined
                child.last_sync = undefined
                childRepository.create(child)
                    .then(async childCreate => {
                        const fitbitLastSync: any = { child_id: childCreate.id, last_sync: '2018-11-19T14:40:00' }
                        await rabbitmq.bus.pubFitbitLastSync(fitbitLastSync)
                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)
                        const query: IQuery = new Query()
                        query.addFilter({ _id: fitbitLastSync.child_id, type: UserType.CHILD })
                        const result = await childRepository.findOne(query)
                        expect(result.last_sync).to.eql(new Date(fitbitLastSync.last_sync))
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a FitbitLastSyncEvent with an invalid fitbit parameter (invalid child_id))', () => {
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

        context('when posting a FitbitLastSyncEvent with an invalid fitbit parameter (invalid last_sync))', () => {
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

        context('when posting a FitbitLastSyncEvent successfully (without MongoDB connection, at first)', () => {
            it('should return an updated child with a new last_sync', (done) => {
                const child: Child = new ChildMock()
                child.last_login = undefined
                child.last_sync = undefined
                childRepository.create(child)
                    .then(async childCreate => {
                        const fitbitLastSync: any = { child_id: childCreate.id, last_sync: '2018-11-19T14:40:00' }
                        await dbConnection.dispose()
                        await rabbitmq.bus.pubFitbitLastSync(fitbitLastSync)
                        setTimeout(async () => {
                            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)
                        }, 1000)

                        setTimeout(async () => {
                            const query: IQuery = new Query()
                            query.addFilter({ _id: fitbitLastSync.child_id, type: UserType.CHILD })
                            const result = await childRepository.findOne(query)
                            expect(result.last_sync).to.eql(new Date(fitbitLastSync.last_sync))
                        }, 2000)
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
