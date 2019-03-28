import { UserDeleteEvent } from '../../../src/application/integration-event/event/user.delete.event'
import { User, UserType } from '../../../src/application/domain/model/user'
import { ObjectID } from 'bson'
import { Institution } from '../../../src/application/domain/model/institution'
import { assert } from 'chai'

describe('IntegrationEvents: UserDelete', () => {
    describe('toJSON()', () => {
        it('should return the user delete event', () => {
            const user: User = new User()
            user.id = `${new ObjectID()}`
            user.username = 'test'
            user.password = 'pass'
            user.type = UserType.ADMIN
            user.institution = new Institution()
            user.institution.id = `${new ObjectID()}`

            const result = new UserDeleteEvent('UserDelete', new Date(), user).toJSON()
            assert.property(result, 'event_name')
            assert.property(result, 'timestamp')
            assert.property(result, 'user')
        })

        context('when the user is undefined', () => {
            it('should return empty object', () => {
                const result = new UserDeleteEvent('UserDelete', new Date(), undefined).toJSON()
                assert.isObject(result)
                assert.isEmpty(result)
            })
        })
    })
})
