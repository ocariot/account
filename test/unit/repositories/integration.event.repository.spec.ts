import sinon from 'sinon'
import { UserMock } from '../../mocks/user.mock'
import { assert } from 'chai'
import { UserDeleteEvent } from '../../../src/application/integration-event/event/user.delete.event'
import { IntegrationEventRepository } from '../../../src/infrastructure/repository/integration.event.repository'
import { IntegrationEventRepoModel } from '../../../src/infrastructure/database/schema/integration.event.schema'
import { UserUpdateEvent } from '../../../src/application/integration-event/event/user.update.event'
import { Child } from '../../../src/application/domain/model/child'
import { ChildMock } from '../../mocks/child.mock'
import { IntegrationEvent } from '../../../src/application/integration-event/event/integration.event'
import { User } from '../../../src/application/domain/model/user'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'

require('sinon-mongoose')

describe('Repositories: IntegrationEvent', () => {
    // Mock events
    const userDeleteEvent: UserDeleteEvent = new UserDeleteEvent('UserDeleteEvent', new Date(), new UserMock())
    const userUpdateEvent: UserUpdateEvent<Child> = new UserUpdateEvent('ChildUpdateEvent', new Date(), new ChildMock())

    const eventsArr: Array<IntegrationEvent<User>> = [userDeleteEvent, userUpdateEvent]

    const integrationEventModelFake: any = IntegrationEventRepoModel
    const integrationRepo = new IntegrationEventRepository(integrationEventModelFake)

    // Mock query
    const queryMock: IQuery = new Query()
    queryMock.addOrdination('created_at', 'desc')

    afterEach(() => {
        sinon.restore()
    })

    describe('create(item: any)', () => {
        context('when create a IntegrationEvent successfully', () => {
            it('should return the IntegrationEvent created', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('create')
                    .withArgs(userDeleteEvent)
                    .chain('exec')
                    .resolves(userDeleteEvent)

                return integrationRepo.create(userDeleteEvent)
                    .then(result => {
                        assert.propertyVal(result, 'event_name', userDeleteEvent.event_name)
                        assert.propertyVal(result, 'type', userDeleteEvent.type)
                        assert.propertyVal(result, 'timestamp', userDeleteEvent.timestamp)
                        assert.propertyVal(result, 'user', userDeleteEvent.user)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('create')
                    .withArgs(userDeleteEvent)
                    .chain('exec')
                    .rejects({ name: 'Error' })

                return integrationRepo.create(userDeleteEvent)
                    .catch(err => {
                        assert.propertyVal(err, 'name', 'Error')
                        assert.propertyVal(err, 'message', err.message)
                    })
            })
        })
    })

    describe('find(query: IQuery)', () => {
        context('when there is at least one IntegrationEvent in the database', () => {
            it('should return an IntegrationEvent array', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('sort')
                    .withArgs(queryMock.toJSON().ordination)
                    .chain('exec')
                    .resolves(eventsArr)

                return integrationRepo.find(queryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no IntegrationEvent in the database', () => {
            it('should return an empty array', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('sort')
                    .withArgs(queryMock.toJSON().ordination)
                    .chain('exec')
                    .resolves(new Array<IntegrationEvent<User>>())

                return integrationRepo.find(queryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('sort')
                    .withArgs(queryMock.toJSON().ordination)
                    .chain('exec')
                    .rejects({ name: 'Error' })

                return integrationRepo.find(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'name', 'Error')
                        assert.propertyVal(err, 'message', err.message)
                    })
            })
        })
    })

    describe('delete(id: string)', () => {
        context('when there is a IntegrationEvent with the received id', () => {
            it('should return true', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ _id: userDeleteEvent.user!.id })
                    .chain('exec')
                    .resolves(true)

                return integrationRepo.delete(userDeleteEvent.user!.id!)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when there is no IntegrationEvent with the received id', () => {
            it('should return false', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ _id: userDeleteEvent.user!.id })
                    .chain('exec')
                    .resolves(false)

                return integrationRepo.delete(userDeleteEvent.user!.id!)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ _id: userDeleteEvent.user!.id })
                    .chain('exec')
                    .rejects({ name: 'Error' })

                return integrationRepo.delete(userDeleteEvent.user!.id!)
                    .catch(err => {
                        assert.propertyVal(err, 'name', 'Error')
                        assert.propertyVal(err, 'message', err.message)
                    })
            })
        })
    })
})
