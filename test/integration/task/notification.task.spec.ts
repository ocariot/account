import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { IBackgroundTask } from '../../../src/application/port/background.task.interface'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { Default } from '../../../src/utils/default'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { IChildRepository } from '../../../src/application/port/child.repository.interface'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { Child } from '../../../src/application/domain/model/child'
import { ChildMock } from '../../mocks/child.mock'
import { NotificationTask } from '../../../src/background/task/notification.task'
import { ILogger } from '../../../src/utils/custom.logger'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const childRepository: IChildRepository = DIContainer.get(Identifier.CHILD_REPOSITORY)
const logger: ILogger = DIContainer.get(Identifier.LOGGER)

describe('NOTIFICATION TASK', () => {
    // Timeout function for control of execution
    const timeout = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    // Start DB connection, RabbitMQ connection and NotificationTask
    before(async () => {
        try {
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

            await deleteAllUsers()

            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] }, rpcTimeout: 5000 })
        } catch (err) {
            throw new Error('Failure on NotificationTask test: ' + err.message)
        }
    })

    // Stop DB connection and NotificationTask
    after(async () => {
        try {
            await deleteAllUsers()

            await dbConnection.dispose()
        } catch (err) {
            throw new Error('Failure on NotificationTask test: ' + err.message)
        }
    })

    /**
     * Creating children with different dates on last_sync and subscribing to the SendNotificationEvent event
     */
    describe('SUBSCRIBE SendNotificationEvent', () => {
        context('when receiving multiple SendNotificationEvent successfully', () => {
            // The notification task will run the job to check the environments inactivity for 10 days or more.
            // Without using a cron expression to provide the necessary freedom for the test, since the functioning
            // of the cron lib is not the object of the test.
            const notificationTask: IBackgroundTask = new NotificationTask(
                rabbitmq, childRepository, logger, 10
            )

            before(async () => {
                try {
                    await deleteAllUsers()

                    const child1: Child = new ChildMock()
                    child1.username = 'child_mock1'
                    child1.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 3))

                    const child2: Child = new ChildMock()
                    child2.username = 'child_mock2'
                    child2.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 5))

                    const child3: Child = new ChildMock()
                    child3.username = 'child_mock3'
                    child3.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 17))

                    const child4: Child = new ChildMock()
                    child4.username = 'child_mock4'
                    child4.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 7))

                    const child5: Child = new ChildMock()
                    child5.username = 'child_mock5'
                    child5.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 11))

                    const child6: Child = new ChildMock()
                    child6.username = 'child_mock6'
                    child6.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 14))

                    const child7: Child = new ChildMock()
                    child7.username = 'child_mock7'
                    child7.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 8))

                    const child8: Child = new ChildMock()
                    child8.username = 'child_mock8'
                    child8.last_sync = new Date()

                    const child9: Child = new ChildMock()
                    child9.username = 'child_mock9'
                    child9.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 10) + (300000))

                    const child10: Child = new ChildMock()
                    child10.username = 'child_mock10'
                    child10.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 15))

                    await childRepository.create(child1) // Does not generate notification
                    await childRepository.create(child2) // The same as above
                    await childRepository.create(child3)
                    await childRepository.create(child4) // Does not generate notification
                    await childRepository.create(child5)
                    await childRepository.create(child6)
                    await childRepository.create(child7) // Does not generate notification
                    await childRepository.create(child8) // The same as above (last_sync equal to current date)
                    await childRepository.create(child9) // The same as above (last_sync at the limit to not notify)
                    await childRepository.create(child10)

                    // Wait a while after registering children
                    await timeout(1000)

                    await notificationTask.run()

                    // Wait at least 2 seconds to be able to execute the first test case
                    await timeout(2000)
                } catch (err) {
                    throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                }
            })
            after(async () => {
                try {
                    await deleteAllUsers()

                    await notificationTask.stop()
                } catch (err) {
                    throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                }
            })
            it('should receive four SendNotificationEvent objects', (done) => {
                let count = 0
                rabbitmq.bus
                    .subSendNotification(() => count++)
                    .then(async () => {
                        await timeout(3000)
                        expect(count).to.eql(4)
                        done()
                    })
                    .catch(done)
            })
        })


        context('when receiving multiple SendNotificationEvent successfully (without MongoDB connection, at first)',
            () => {
                // The notification task will run the job to check the environments inactivity for 10 days or more.
                // Without using a cron expression to provide the necessary freedom for the test, since its functioning
                // is not the object of the test.
                const notificationTask: IBackgroundTask = new NotificationTask(
                    rabbitmq, childRepository, logger, 7
                )

                before(async () => {
                    try {
                        await deleteAllUsers()

                        const child1: Child = new ChildMock()
                        child1.username = 'child_mock1'
                        child1.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 3))

                        const child2: Child = new ChildMock()
                        child2.username = 'child_mock2'
                        child2.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 5))

                        const child3: Child = new ChildMock()
                        child3.username = 'child_mock3'
                        child3.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 17))

                        const child4: Child = new ChildMock()
                        child4.username = 'child_mock4'
                        child4.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 7) + (300000))

                        const child5: Child = new ChildMock()
                        child5.username = 'child_mock5'
                        child5.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 11))

                        const child6: Child = new ChildMock()
                        child6.username = 'child_mock6'
                        child6.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 14))

                        const child7: Child = new ChildMock()
                        child7.username = 'child_mock7'
                        child7.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 8))

                        const child8: Child = new ChildMock()
                        child8.username = 'child_mock8'
                        child8.last_sync = new Date()

                        const child9: Child = new ChildMock()
                        child9.username = 'child_mock9'
                        child9.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 10))

                        const child10: Child = new ChildMock()
                        child10.username = 'child_mock10'
                        child10.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 15))

                        await childRepository.create(child1) // Does not generate notification
                        await childRepository.create(child2) // The same as above
                        await childRepository.create(child3)
                        await childRepository.create(child4) // Doesn't generate notification (last_sync at the limit)
                        await childRepository.create(child5)
                        await childRepository.create(child6)
                        await childRepository.create(child7)
                        await childRepository.create(child8) // Does not generate notification (last_sync equal to current date)
                        await childRepository.create(child9)
                        await childRepository.create(child10)

                        // Wait a while after registering children
                        await timeout(1000)

                        // Taking down MongoDB
                        await dbConnection.dispose()

                        // Run the Notification task
                        notificationTask.run()

                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

                        // Wait at least 3 seconds to be able to execute the first test case
                        await timeout(3000)
                    } catch (err) {
                        throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                    }
                })
                after(async () => {
                    try {
                        await deleteAllUsers()

                        await notificationTask.stop()
                    } catch (err) {
                        throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                    }
                })
                it('should receive four SendNotificationEvent objects', (done) => {
                    let count = 0
                    rabbitmq.bus
                        .subSendNotification(() => count++)
                        .then(async () => {
                            await timeout(3000)
                            expect(count).to.eql(6)
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
