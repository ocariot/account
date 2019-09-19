import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { IBackgroundTask } from '../../../src/application/port/background.task.interface'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { Default } from '../../../src/utils/default'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { IChildRepository } from '../../../src/application/port/child.repository.interface'
import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
import { InstitutionRepoModel } from '../../../src/infrastructure/database/schema/institution.schema'
import { Child } from '../../../src/application/domain/model/child'
import { ChildMock } from '../../mocks/child.mock'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const providerEventBusTask: IBackgroundTask = DIContainer.get(Identifier.PROVIDER_EVENT_BUS_TASK)
const childRepository: IChildRepository = DIContainer.get(Identifier.CHILD_REPOSITORY)

describe('PROVIDER EVENT BUS TASK', () => {
    // Start DB connection, RabbitMQ connection and ProviderEventBusTask
    before(async () => {
        try {
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                { interval: 100 })

            await deleteAllUsers()
            await deleteAllInstitutions()

            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] }, rpcTimeout: 5000 })

            await providerEventBusTask.run()
        } catch (err) {
            throw new Error('Failure on ProviderEventBusTask test: ' + err.message)
        }
    })

    // Stop DB connection and ProviderEventBusTask
    after(async () => {
        try {
            await deleteAllUsers()
            await deleteAllInstitutions()

            await dbConnection.dispose()

            await providerEventBusTask.stop()
        } catch (err) {
            throw new Error('Failure on ProviderEventBusTask test: ' + err.message)
        }
    })

    /**
     * PROVIDERS
     */
    describe('Provider Child', () => {
        // before(async () => {
        //     try {
        //         await deleteAllUsers()
        //     } catch (err) {
        //         throw new Error('Failure on Provider Child test: ' + err.message)
        //     }
        // })
        context('when retrieving children through a query successfully when there is at least ' +
            'one matching child associated with the institution_id passed in the query', () => {
            // Delete all children from database after each test case
            after(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Provider Child test: ' + err.message)
                }
            })
            it('should return an array with one child', (done) => {
                const child: Child = new ChildMock()
                child.institution!.id = '5a62be07d6f33400146c9b61'

                childRepository.create(child)
                    .then(async () => {
                        const result = await rabbitmq.bus.getChildren('?institution=5a62be07d6f33400146c9b61')
                        expect(result.length).to.eql(1)
                        // As a new resource saved in the database always has a new id,
                        // this is necessary before comparing the saved resource in the
                        // database with the one sent to the bus.
                        child.id = result[0].id
                        // Comparing the resources
                        expect(result[0].id).to.eql(child.id)
                        expect(result[0].username).to.eql(child.username)
                        expect(result[0].type).to.eql(child.type)
                        expect(result[0].institution_id).to.eql(child.institution!.id)
                        expect(result[0].gender).to.eql(child.gender)
                        expect(result[0].age).to.eql(child.age)
                        expect(result[0].last_login).to.eql(child.last_login!.toISOString())
                        expect(result[0].last_sync).to.eql(child.last_sync!.toISOString())
                        done()
                    })
                    .catch(done)
            })
        })

        context('when retrieving physical activities through a query successfully when there is at least ' +
            'one matching activity', () => {
            before(async () => {
                try {
                    const child1: Child = new ChildMock()
                    child1.institution!.id = '5a62be07d6f33400146c9b61'

                    const child2: Child = new ChildMock()
                    child2.institution!.id = '5a62be07d6f33400146c9b61'

                    const child3: Child = new ChildMock()
                    child3.institution!.id = '5a62be07de34500146d9c544'

                    const child4: Child = new ChildMock()
                    child4.institution!.id = '5a62be07de34500146d9c544'

                    const child5: Child = new ChildMock()
                    child5.institution!.id = '5a62be07d6f33400146c9b61'

                    const child6: Child = new ChildMock()
                    child6.institution!.id = '5a62be07de34500146d9c544'

                    await childRepository.create(child1)
                    await childRepository.create(child2)
                    await childRepository.create(child3)
                    await childRepository.create(child4)
                    await childRepository.create(child5)
                    await childRepository.create(child6)
                } catch (err) {
                    throw new Error('Failure on Provider Child test: ' + err.message)
                }
            })
            after(async () => {
                try {
                    await deleteAllUsers()
                } catch (err) {
                    throw new Error('Failure on Provider Child test: ' + err.message)
                }
            })
            it('should return an array with six children (regardless of association with an institution)', (done) => {
                rabbitmq.bus.getChildren('')
                    .then(result => {
                        expect(result.length).to.eql(6)
                        done()
                    })
                    .catch(done)
            })

            it('should return an empty array (no child matches query)', (done) => {
                rabbitmq.bus.getChildren('?institution=5a62be07d6f33400146c9b64')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with three children (query all activities by child_id)', (done) => {
                rabbitmq.bus.getChildren('?institution=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when trying to recover children through a query unsuccessful (without MongoDB connection)',
            () => {
                before(async () => {
                    try {
                        const child1: Child = new ChildMock()
                        child1.institution!.id = '5a62be07d6f33400146c9b61'
                        const child2: Child = new ChildMock()
                        child2.institution!.id = '5a62be07d6f33400146c9b61'

                        await childRepository.create(child1)
                        await childRepository.create(child2)
                    } catch (err) {
                        throw new Error('Failure on Provider Child test: ' + err.message)
                    }
                })
                after(async () => {
                    try {
                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)
                        await deleteAllUsers()
                    } catch (err) {
                        throw new Error('Failure on Provider Child test: ' + err.message)
                    }
                })
                it('should return a rpc timeout error', (done) => {
                    dbConnection.dispose().then(async () => {
                        try {
                            await rabbitmq.bus.getChildren('?child_id=5a62be07d6f33400146c9b61')
                            done(new Error('Test failed'))
                        } catch (err) {
                            try {
                                expect(err.message).to.eql('rpc timed out')
                                done()
                            } catch (e) {
                                done(e)
                            }
                        }
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
