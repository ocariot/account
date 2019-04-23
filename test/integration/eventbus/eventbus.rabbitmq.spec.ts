import { expect } from 'chai'
import { Container } from 'inversify'
import { DI } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { IEventBus } from '../../../src/infrastructure/port/event.bus.interface'
import { UserDeleteEvent } from '../../../src/application/integration-event/event/user.delete.event'
import { EventBusException } from '../../../src/application/domain/exception/eventbus.exception'
import { UserUpdateEvent } from '../../../src/application/integration-event/event/user.update.event'
import { UserMock, UserTypeMock } from '../../mocks/user.mock'
import { ChildMock } from '../../mocks/child.mock'
import { FamilyMock } from '../../mocks/family.mock'
import { InstitutionEvent } from '../../../src/application/integration-event/event/institution.event'
import { InstitutionMock } from '../../mocks/institution.mock'

const container: Container = DI.getInstance().getContainer()
const eventBus: IEventBus = container.get(Identifier.RABBITMQ_EVENT_BUS)

describe('EVENT BUS', () => {
    before(() => eventBus.enableLogger(false))

    afterEach(async () => {
        try {
            await eventBus.dispose()
        } catch (err) {
            throw new Error('Failure on EventBus test: ' + err.message)
        }
    })

    describe('CONNECTION', () => {
        it('should return EventBusException with message without connection when publishing.', () => {
            return eventBus
                .publish(new UserDeleteEvent(''), '')
                .then((result: boolean) => {
                    expect(result).to.eql(false)
                })
                .catch((err: EventBusException) => {
                    expect(err).instanceOf(EventBusException)
                })
        })

        it('should return EventBusException with message without connection when subscription.', () => {
            // Describe your test
        })

        it('should connect successfully to publish.', async () => {
            try {
                await eventBus.connectionPub.tryConnect(1, 500)
                expect(eventBus.connectionPub.isConnected).to.eql(true)
            } catch (err) {
                throw new Error('Failure on EventBus test: ' + err.message)
            }
        })

        it('should connect successfully to subscribe.', async () => {
            try {
                await eventBus.connectionSub.tryConnect(1, 500)
                expect(eventBus.connectionSub.isConnected).to.eql(true)
            } catch (err) {
                throw new Error('Failure on EventBus test: ' + err.message)
            }
        })
    })

    describe('SUBSCRIBE', () => {
        // Describe your tests
    })

    describe('PUBLISH', () => {
        context('User type CHILD', () => {
            it('should return true for updated user type CHILD.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new UserUpdateEvent('ChildUpdateEvent', new Date(), new ChildMock()),
                        'children.update')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })
        })

        context('User type FAMILY', () => {
            it('should return true for updated user type FAMILY.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new UserUpdateEvent('FamilyUpdateEvent', new Date(), new FamilyMock()),
                        'families.update')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })
        })

        context('User type EDUCATOR', () => {
            it('should return true for updated user type EDUCATOR.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new UserUpdateEvent('EducatorUpdateEvent', new Date(), new UserMock(UserTypeMock.EDUCATOR)),
                        'educators.update')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })
        })

        context('User type HEALTH PROFESSIONAL', () => {
            it('should return true for updated user type HEALTH PROFESSIONAL.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new UserUpdateEvent('HealthProfessionalUpdateEvent', new Date(),
                            new UserMock(UserTypeMock.HEALTH_PROFESSIONAL)),
                        'healthprofessionals.update')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })
        })

        context('User type APPLICATION', () => {
            it('should return true for updated user type APPLICATION.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new UserUpdateEvent('ApplicationUpdateEvent', new Date(), new UserMock(UserTypeMock.APPLICATION)),
                        'applications.update')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })
        })

        context('User', () => {
            it('should return true for deleted user.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new UserUpdateEvent('UserDeleteEvent', new Date(), new UserMock()),
                        'users.delete')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })
        })

        context('Institution', () => {
            it('should return true for deleted institution.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new InstitutionEvent('InstitutionDeleteEvent', new Date(), new InstitutionMock()),
                        'institutions.delete')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })
        })
    })
})
