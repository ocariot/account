import { expect } from 'chai'
import { Container } from 'inversify'
import { DI } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { IEventBus } from '../../../src/infrastructure/port/event.bus.interface'
import { UserDeleteEvent } from '../../../src/application/integration-event/event/user.delete.event'
import { EventBusException } from '../../../src/application/domain/exception/eventbus.exception'

const container: Container = DI.getInstance().getContainer()
const eventBus: IEventBus = container.get(Identifier.RABBITMQ_EVENT_BUS)

describe('EVENT BUS', () => {
    before(() => eventBus.enableLogger(false))

    describe('CONNECTION', () => {
        it('should return EventBusException with message without connection when publishing.', () => {
            return eventBus
                .publish(new UserDeleteEvent(''), '')
                .catch((err: EventBusException) => {
                    expect(err).instanceOf(EventBusException)
                })
        })

        it('should return EventBusException with message without connection when subscription.', () => {
            // Describe your test
        })

        it('should connect successfully to publish.', async () => {
            await eventBus.connectionPub.tryConnect(1, 500)
        })

        it('should connect successfully to subscribe.', async () => {
            await eventBus.connectionSub.tryConnect(1, 500)
        })
    })

    describe('PUBLISH', () => {
        context('User type CHILD', () => {
            // describe your test
        })

        context('User type FAMILY', () => {
            // describe your test
        })

        context('User type EDUCATOR', () => {
            // describe your test
        })

        context('User type HEALTH PROFESSIONAL', () => {
            // describe your test
        })

        context('User type APPLICATION', () => {
            // describe your test
        })
    })

    describe('SUBSCRIBE', () => {
        // Describe your tests
    })
})
