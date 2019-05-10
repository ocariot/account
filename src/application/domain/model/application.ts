import { User, UserType } from './user'
import { JsonUtils } from '../utils/json.utils'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

/**
 * Implementation of the application entity.
 *
 * @extends {User}
 * @implements { IJSONSerializable, IJSONDeserializable<Application>}
 */
export class Application extends User implements IJSONSerializable, IJSONDeserializable<Application> {
    private _application_name?: string // Name of application.

    constructor() {
        super()
        super.type = UserType.APPLICATION
        super.scopes = [
            'applications:read',
            'institutions:read',
            'institutions:readAll',
            'questionnaires:create',
            'questionnaires:read',
            'foodrecord:create',
            'foodrecord:read',
            'physicalactivities:create',
            'physicalactivities:read',
            'physicalactivities:update',
            'physicalactivities:delete',
            'sleep:create',
            'sleep:read',
            'sleep:update',
            'sleep:delete',
            'environment:create',
            'environment:read',
            'environment:update',
            'environment:delete',
            'missions:create',
            'missions:read',
            'missions:update',
            'missions:delete',
            'gamificationprofile:create',
            'gamificationprofile:read',
            'gamificationprofile:update',
            'gamificationprofile:delete'
        ]
    }

    get application_name(): string | undefined {
        return this._application_name
    }

    set application_name(value: string | undefined) {
        this._application_name = value
    }

    public fromJSON(json: any): Application {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.application_name !== undefined) this.application_name = json.application_name

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{ application_name: this.application_name }
        }
    }
}
