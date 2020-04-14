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

    describe('SUBSCRIBE SendNotificationEvent', () => {
        /**
         * Creating children with different dates on last_sync and subscribing to the SendNotificationEvent event
         */
        context('when the notification task is executed', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    await createChildrenToNotify()
                } catch (err) {
                    throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                }
            })

            it('should receive four SendNotificationEvent objects successfully when there are four children ' +
                'with outdated last_sync', (done) => {
                // The notification task will run the job to check the children's inactivity for 10 days or more.
                // Without using a cron expression to provide the necessary freedom for the test, since the functioning
                // of the cron lib is not the object of the test.
                const notificationTask: IBackgroundTask = new NotificationTask(
                    rabbitmq, childRepository, logger, 10
                )

                notificationTask.run()

                // Subscribing SendNotificationEvent events
                let count = 0
                rabbitmq.bus
                    .subSendNotification(() => count++)
                    .then()
                    .catch(done)

                // Performing the test
                setTimeout(async () => {
                    try {
                        expect(count).to.eql(4)
                        await notificationTask.stop()
                        done()
                    } catch (err) {
                        done(err)
                    }
                }, 4000)
            })

            it('should receive seven SendNotificationEvent objects successfully when there are seven children ' +
                'with outdated last_sync (without MongoDB connection, at first)', (done) => {
                // This time it runs the task checking children's inactivity for 7 days or more.
                const notificationTask: IBackgroundTask = new NotificationTask(
                    rabbitmq, childRepository, logger, 7
                )

                // Closing the MongoDB connection and starting the task
                dbConnection.dispose()
                    .then(() => {
                        notificationTask.run()
                    })
                    .catch(done)

                // Raising the MongoDB connection again and performing the test
                setTimeout(() => {
                    dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)
                        .then()
                        .catch(done)
                }, 1000)

                let count = 0
                rabbitmq.bus
                    .subSendNotification(() => count++)
                    .then()
                    .catch(done)

                setTimeout(async () => {
                    try {
                        expect(count).to.eql(7)
                        await notificationTask.stop()
                        done()
                    } catch (err) {
                        done(err)
                    }
                }, 5000)
            })
        })

        context('when the notification task is executed but no notification is sent', () => {
            before(async () => {
                try {
                    await deleteAllUsers()

                    await createChildrenToNotNotify()
                } catch (err) {
                    throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                }
            })

            it('should not receive any SendNotificationEvent object since all children have the last_sync updated',
                (done) => {
                const notificationTask: IBackgroundTask = new NotificationTask(
                    rabbitmq, childRepository, logger, 10
                )

                notificationTask.run()

                // Subscribing SendNotificationEvent events
                let count = 0
                rabbitmq.bus
                    .subSendNotification(() => count++)
                    .then()
                    .catch(done)

                // Performing the test
                setTimeout(async () => {
                    try {
                        expect(count).to.eql(0)
                        await notificationTask.stop()
                        done()
                    } catch (err) {
                        done(err)
                    }
                }, 4000)
            })

            it('should not receive any SendNotificationEvent object as there are no children in the repository',
                (done) => {
                    const notificationTask: IBackgroundTask = new NotificationTask(
                        rabbitmq, childRepository, logger, 7
                    )

                    // Removing all children created in the 'before' block
                    deleteAllUsers()
                        .then(() => {
                            // Closing the MongoDB connection and starting the task
                            dbConnection.dispose()
                                .then(() => {
                                    notificationTask.run()
                                })
                                .catch(done)
                        })
                        .catch(done)

                    // Raising the MongoDB connection again and performing the test
                    setTimeout(() => {
                        dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)
                            .then()
                            .catch(done)
                    }, 1000)

                    let count = 0
                    rabbitmq.bus
                        .subSendNotification(() => count++)
                        .then()
                        .catch(done)

                    setTimeout(async () => {
                        try {
                            expect(count).to.eql(0)
                            await notificationTask.stop()
                            done()
                        } catch (err) {
                            done(err)
                        }
                    }, 5000)
                })
        })
    })
})

async function deleteAllUsers() {
    return UserRepoModel.deleteMany({})
}

async function createChildrenToNotify() {
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
    child4.last_sync = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 9))

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

    await childRepository.create(child1)
    await childRepository.create(child2)
    await childRepository.create(child3)
    await childRepository.create(child4)
    await childRepository.create(child5)
    await childRepository.create(child6)
    await childRepository.create(child7)
    await childRepository.create(child8)
    await childRepository.create(child9)
    await childRepository.create(child10)
}

async function createChildrenToNotNotify() {
    const child1: Child = new ChildMock()
    child1.username = 'child_mock1'
    child1.last_sync = new Date()

    const child2: Child = new ChildMock()
    child2.username = 'child_mock2'
    child2.last_sync = new Date()

    const child3: Child = new ChildMock()
    child3.username = 'child_mock3'
    child3.last_sync = new Date()

    const child4: Child = new ChildMock()
    child4.username = 'child_mock4'
    child4.last_sync = new Date()

    const child5: Child = new ChildMock()
    child5.username = 'child_mock5'
    child5.last_sync = new Date()

    const child6: Child = new ChildMock()
    child6.username = 'child_mock6'
    child6.last_sync = new Date()

    const child7: Child = new ChildMock()
    child7.username = 'child_mock7'
    child7.last_sync = new Date()

    await childRepository.create(child1)
    await childRepository.create(child2)
    await childRepository.create(child3)
    await childRepository.create(child4)
    await childRepository.create(child5)
    await childRepository.create(child6)
    await childRepository.create(child7)
}
