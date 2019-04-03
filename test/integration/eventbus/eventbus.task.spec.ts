import { expect } from 'chai'
import { DI } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { Container } from 'inversify'
import { EventBusTask } from '../../../src/background/task/eventbus.task'
import { IIntegrationEventRepository } from '../../../src/application/port/integration.event.repository.interface'
import { IntegrationEventRepoModel } from '../../../src/infrastructure/database/schema/integration.event.schema'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { IConnectionDB } from '../../../src/infrastructure/port/connection.db.interface'
import { UserDeleteEvent } from '../../../src/application/integration-event/event/user.delete.event'
import { UserMock } from '../../mocks/user.mock'
import { UserUpdateEvent } from '../../../src/application/integration-event/event/user.update.event'
import { Child } from '../../../src/application/domain/model/child'
import { ChildMock } from '../../mocks/child.mock'
import { Family } from '../../../src/application/domain/model/family'
import { FamilyMock } from '../../mocks/family.mock'
import { Educator } from '../../../src/application/domain/model/educator'
import { EducatorMock } from '../../mocks/educator.mock'
import { HealthProfessional } from '../../../src/application/domain/model/health.professional'
import { HealthProfessionalMock } from '../../mocks/health.professional.mock'
import { Application } from '../../../src/application/domain/model/application'
import { ApplicationMock } from '../../mocks/application.mock'

const container: Container = DI.getInstance().getContainer()
const eventBusTask: EventBusTask = container.get(Identifier.EVENT_BUS_TASK)
const integrationRepository: IIntegrationEventRepository = container.get(Identifier.INTEGRATION_EVENT_REPOSITORY)
const mongoDBConnection: IConnectionDB = container.get(Identifier.MONGODB_CONNECTION)

describe('EVENT BUS TASK', () => {
    before(async () => {
        await mongoDBConnection.tryConnect(0, 500)
        deleteAllIntegrationEvents()
    })

    afterEach(async () => {
        deleteAllIntegrationEvents()
        await eventBusTask.stop()
    })

    after(() => {
        deleteAllIntegrationEvents()
    })

    describe('PUBLISH SAVED EVENTS', () => {
        context('when all events are valid and there is a connection with RabbitMQ', () => {
            it('should return an empty array', async () => {
                try {
                    await createUserIntegrationEvent()
                    await createChildIntegrationEvent()
                    await createFamilyIntegrationEvent()
                    await createEducatorIntegrationEvent()
                    await createHealthProfessionalIntegrationEvent()
                    await createApplicationIntegrationEvent()

                    eventBusTask.run()

                    // Wait for 1000 milliseconds
                    const sleep = (milliseconds) => {
                        return new Promise(resolve => setTimeout(resolve, milliseconds))
                    }

                    await sleep(1000)

                    const result: Array<any> = await integrationRepository.find(new Query())    // Search in repository
                    expect(result.length).to.eql(0)
                } catch (err) {
                    console.log(err)
                }
            })
        })

        context('when the event name does not match any of the expected', () => {
            it('should return an array of the same size as the number of events sent', async () => {
                const event: UserDeleteEvent = new UserDeleteEvent('WrongUserDeleteEvent', new Date(), new UserMock())
                const saveEvent: any = event.toJSON()
                saveEvent.__operation = 'publish'
                saveEvent.__routing_key = 'users.delete'

                try {
                    await integrationRepository
                        .create(JSON.parse(JSON.stringify(saveEvent)))

                    eventBusTask.run()

                    // Wait for 1000 milliseconds
                    const sleep = (milliseconds) => {
                        return new Promise(resolve => setTimeout(resolve, milliseconds))
                    }
                    await sleep(1000)

                    const result: Array<any> = await integrationRepository.find(new Query())
                    expect(result.length).to.eql(1)
                } catch (err) {
                    console.log(err)
                }
            })
        })

        context('when there is some wrong parameter in the event', () => {
            it('should throw an Exception', async () => {
                const event: UserDeleteEvent = new UserDeleteEvent('UserDeleteEvent', new Date(), new UserMock())
                const saveEvent: any = event.toJSON()
                saveEvent.__operation = 'publish'
                saveEvent.__routing_key = 'users.delete'

                try {
                    await integrationRepository
                        .create(JSON.stringify(saveEvent))          // Mock throw an exception (not parse the JSON)

                    eventBusTask.run()

                    // Wait for 1000 milliseconds
                    const sleep = (milliseconds) => {
                        return new Promise(resolve => setTimeout(resolve, milliseconds))
                    }
                    await sleep(1000)

                    const result: Array<any> = await integrationRepository.find(new Query())
                    expect(result.length).to.eql(1)
                } catch (err) {
                    expect(err).to.have.property('message')
                }
            })
        })

        // Before running this test, the connection to the RabbitMQ must be dropped manually
        // context('when there is no connection to RabbitMQ', () => {
        //     it('should return a non-empty array', async () => {
        //         try {
        //             await createUserIntegrationEvent()
        //             await createChildIntegrationEvent()
        //             await createFamilyIntegrationEvent()
        //             await createEducatorIntegrationEvent()
        //             await createHealthProfessionalIntegrationEvent()
        //             await createApplicationIntegrationEvent()
        //
        //             eventBusTask.run()
        //
        //             // Wait for 1000 milliseconds
        //             const sleep = (milliseconds) => {
        //                 return new Promise(resolve => setTimeout(resolve, milliseconds))
        //             }
        //
        //             await sleep(1000)
        //
        //             const result: Array<any> = await integrationRepository.find(new Query())
        //             expect(result.length).to.eql(6)
        //         } catch (err) {
        //             console.log(err)
        //         }
        //     })
        // })
    })
})

async function createUserIntegrationEvent(): Promise<any> {
    // Delete
    const event: UserDeleteEvent = new UserDeleteEvent('UserDeleteEvent', new Date(), new UserMock())
    const saveEvent: any = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'users.delete'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

    return Promise.resolve()
}

async function createChildIntegrationEvent(): Promise<any> {
    // Update
    const event: UserUpdateEvent<Child> = new UserUpdateEvent('ChildUpdateEvent', new Date(), new ChildMock())
    const saveEvent: any = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'children.update'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

    return Promise.resolve()
}

async function createFamilyIntegrationEvent(): Promise<any> {
    // Update
    const event: UserUpdateEvent<Family> = new UserUpdateEvent('FamilyUpdateEvent', new Date(), new FamilyMock())
    const saveEvent: any = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'families.update'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

    return Promise.resolve()
}

async function createEducatorIntegrationEvent(): Promise<any> {
    // Update
    const event: UserUpdateEvent<Educator> = new UserUpdateEvent('EducatorUpdateEvent', new Date(), new EducatorMock())
    const saveEvent: any = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'educators.update'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

    return Promise.resolve()
}

async function createHealthProfessionalIntegrationEvent(): Promise<any> {
    // Update
    const event: UserUpdateEvent<HealthProfessional> = new UserUpdateEvent('HealthProfessionalUpdateEvent',
        new Date(), new HealthProfessionalMock())
    const saveEvent: any = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'healthprofessionals.update'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

    return Promise.resolve()
}

async function createApplicationIntegrationEvent(): Promise<any> {
    // Update
    const event: UserUpdateEvent<Application> = new UserUpdateEvent('ApplicationUpdateEvent',
        new Date(), new ApplicationMock())
    const saveEvent: any = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'healthprofessionals.update'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

    return Promise.resolve()
}

function deleteAllIntegrationEvents(): void {
    IntegrationEventRepoModel.deleteMany({}, err => {
        if (err) console.log(err)
    })
}
