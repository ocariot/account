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
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

            await deleteAllInstitutions()
            await deleteAllUsers()

            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                { receiveFromYourself: true, sslOptions: { ca: [] } })

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
            let fitbitLastSync: any = {}
            before(async () => {
                try {
                    const child: Child = new ChildMock()
                    child.last_login = undefined
                    child.last_sync = undefined
                    childRepository.create(child).then(result => {
                        fitbitLastSync = { child_id: result.id,
                                           last_sync: '2018-11-19T14:40:00' }
                    })
                } catch (err) {
                    throw new Error('Failure on Subscribe FitbitLastSyncEvent test: ' + err.message)
                }
            })
            it('should return an updated child', (done) => {
                rabbitmq.bus.pubFitbitLastSync(fitbitLastSync).then(() => {
                    // Wait for 1000 milliseconds for the task to be executed
                    timeout(1000).then(() => {
                        const query: IQuery = new Query()
                        query.addFilter({ _id: fitbitLastSync.child_id, type: UserType.CHILD })
                        childRepository.findOne(query).then(result => {
                            expect(result.last_sync).to.eql(new Date(fitbitLastSync.last_sync))
                            // As a new resource saved in the database always has a new id,
                            // this is necessary before comparing the saved resource in the
                            // database with the one sent to the bus.
                            // result[0].child_id = result[0].child_id.toString()
                            // activity.id = result[0].id
                            // Comparing the resources
                            // expect(result[0]).to.eql(activity)
                            done()
                        })
                    })
                })
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
