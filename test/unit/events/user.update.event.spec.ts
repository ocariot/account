import { User } from '../../../src/application/domain/model/user'
import { assert } from 'chai'
import { UserUpdateEvent } from '../../../src/application/integration-event/event/user.update.event'
import { UserMock, UserTypeMock } from '../../mocks/user.mock'

describe('IntegrationEvents: UserUpdate', () => {
    describe('toJSON()', () => {
        it('should return the user update event', () => {
            const user: User = new UserMock()
            user.type = UserTypeMock.CHILD

            const result = new UserUpdateEvent('UserUpdate', new Date(), user).toJSON()
            assert.propertyVal(result, 'event_name', 'UserUpdate')
            assert.property(result, 'timestamp')
            assert.propertyVal(result.child, 'id', user.id)
            assert.propertyVal(result.child, 'username', user.username)
            assert.propertyVal(result.child, 'type', user.type)
            assert.propertyVal(result.child, 'institution_id', user.institution!.id)
            assert.propertyVal(result.child, 'last_login', user.last_login!.toISOString())
        })

        context('when the user is undefined', () => {
            it('should return empty object', () => {
                const result = new UserUpdateEvent('UserUpdate', new Date(), undefined).toJSON()
                assert.isEmpty(result)
            })
        })
    })
})
