import { IntegrationEvent } from './integration.event'
import { User } from '../../domain/model/user'

export class UserDeleteEvent extends IntegrationEvent<User> {
    constructor(public event_name: string, public timestamp?: Date, public user?: User) {
        super(event_name, timestamp)
    }

    public toJSON(): any {
        if (!this.user) return {}
        return {
            event_name: this.event_name,
            timestamp: this.timestamp,
            user: this.user.toJSON()
        }
    }
}
