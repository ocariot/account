import { User, UserType } from './user'
import { JsonUtils } from '../utils/json.utils'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

/**
 * Implementation of the application entity.
 *
 * @extends {User}
 * @implements {ISerializable<Application>}
 */
export class Application extends User implements IJSONSerializable, IJSONDeserializable<Application> {
    private _application_name?: string // Name of application.

    constructor() {
        super()
        super.type = UserType.APPLICATION
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
        return Object.assign(super.toJSON(), {
            application_name: this.application_name
        })
    }
}
