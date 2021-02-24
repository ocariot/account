import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { IBackgroundTask } from '../../../src/application/port/background.task.interface'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { Default } from '../../../src/utils/default'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { ChildMock } from '../../mocks/child.mock'
import { NotificationTask } from '../../../src/background/task/notification.task'
import { ILogger } from '../../../src/utils/custom.logger'
import { IChildRepository } from '../../../src/application/port/child.repository.interface'

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

            // it('should receive four SendNotificationEvent objects successfully when there are four children ' +
            //     'with outdated last_sync', (done) => {
            //     // The notification task will run the job to check the children's inactivity for 10 days or more.
            //     // Without using a cron expression to provide the necessary freedom for the test, since the functioning
            //     // of the cron lib is not the object of the test.
            //     const notificationTask: IBackgroundTask = new NotificationTask(
            //         rabbitmq, childRepository, logger, 10
            //     )
            //
            //     notificationTask.run()
            //
            //     // Subscribing SendNotificationEvent events
            //     let count = 0
            //     rabbitmq.bus
            //         .subSendNotification(() => count++)
            //         .then()
            //         .catch(done)
            //
            //     // Performing the test
            //     setTimeout(async () => {
            //         try {
            //             expect(count).to.eql(4)
            //             await notificationTask.stop()
            //             done()
            //         } catch (err) {
            //             done(err)
            //         }
            //     }, 5000)
            // })

            it('should receive seven SendNotificationEvent objects successfully when there are seven children ' +
                'with outdated last_sync', (done) => {
                // This time it runs the task checking children's inactivity for 7 days or more.
                const notificationTask: IBackgroundTask = new NotificationTask(
                    rabbitmq, childRepository, logger, 7
                )

                notificationTask.run()

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

            afterEach(async () => {
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
                    }, 5000)
                })

            it('should not receive any SendNotificationEvent object as there are no children in the repository',
                (done) => {
                    const notificationTask: IBackgroundTask = new NotificationTask(
                        rabbitmq, childRepository, logger, 7
                    )

                    notificationTask.run()

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


async function createUser(item) {
    return UserRepoModel.create(item)
}

async function deleteAllUsers() {
    return UserRepoModel.deleteMany({})
}

function generateChild(username, lastSync) {
    const result = new ChildMock().toJSON()
    result.username = username
    result.password = '123'
    result.last_sync = lastSync
    return result
}

async function createChildrenToNotify() {
    const child1 = generateChild('child_mock1', new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 3)))
    const child2 = generateChild('child_mock2', new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 5)))
    const child3 = generateChild('child_mock3', new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 17)))
    const child4 = generateChild('child_mock4', new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 9)))
    const child5 = generateChild('child_mock5', new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 11)))
    const child6 = generateChild('child_mock6', new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 14)))
    const child7 = generateChild('child_mock7', new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 8)))
    const child8 = generateChild('child_mock8', new Date())
    const child9 = generateChild('child_mock9', new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 10) + (300000)))
    const child10 = generateChild('child_mock10', new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 15)))

    await createUser(child1)
    await createUser(child2)
    await createUser(child3)
    await createUser(child4)
    await createUser(child5)
    await createUser(child6)
    await createUser(child7)
    await createUser(child8)
    await createUser(child9)
    await createUser(child10)
}

async function createChildrenToNotNotify() {
    const child1 = generateChild('child_mock1', new Date())
    const child2 = generateChild('child_mock2', new Date())
    const child3 = generateChild('child_mock3', new Date())
    const child4 = generateChild('child_mock4', new Date())
    const child5 = generateChild('child_mock5', new Date())
    const child6 = generateChild('child_mock6', new Date())
    const child7 = generateChild('child_mock7', new Date())

    await createUser(child1)
    await createUser(child2)
    await createUser(child3)
    await createUser(child4)
    await createUser(child5)
    await createUser(child6)
    await createUser(child7)
}
