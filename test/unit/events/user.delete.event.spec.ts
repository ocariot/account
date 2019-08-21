import { UserDeleteEvent } from '../../../src/application/integration-event/event/user.delete.event'
import { User } from '../../../src/application/domain/model/user'
import { assert } from 'chai'
import { UserMock } from '../../mocks/user.mock'

describe('IntegrationEvents: UserDelete', () => {
    describe('toJSON()', () => {
        it('should return the user delete event', () => {
            const user: User = new UserMock()

            const result = new UserDeleteEvent('UserDelete', new Date(), user).toJSON()
            assert.propertyVal(result, 'event_name', 'UserDelete')
            assert.property(result, 'timestamp')
            assert.propertyVal(result.user, 'id', user.id)
            assert.propertyVal(result.user, 'username', user.username)
            assert.propertyVal(result.user, 'type', user.type)
            assert.propertyVal(result.user, 'institution_id', user.institution!.id)
            assert.propertyVal(result.user, 'last_login', user.last_login!.toISOString())
        })

        context('when the user is undefined', () => {
            it('should return empty object', () => {
                const result = new UserDeleteEvent('UserDelete', new Date(), undefined).toJSON()
                assert.isEmpty(result)
            })
        })
    })
})
