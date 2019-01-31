import { IntegrationEvent } from './integration.event'
import { User } from '../../domain/model/user'

export class UserDeleteEvent<E extends User> extends IntegrationEvent<E> {
    constructor(public event_name: string, public timestamp?: Date, public user?: E) {
        super(event_name, timestamp)
    }

    public toJSON(): any {
        if (!this.user) return {}
        return {
            event_name: this.event_name,
            timestamp: this.timestamp,
            [this.user.type ? this.user.type : 'user']: this.user.toJSON()
        }
    }
}
