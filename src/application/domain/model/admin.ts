import { User, UserType } from './user'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

/**
 * Implementation of the admin entity.
 *
 * @extends {User}
 * @implements {IJSONSerializable, IJSONDeserializable<Admin>}
 */
export class Admin extends User implements IJSONSerializable, IJSONDeserializable<Admin> {

    constructor(username?: string, password?: string) {
        super()
        super.type = UserType.ADMIN
    }

    public fromJSON(json: any): Admin {
        super.fromJSON(json)

        return this
    }

    public toJSON(): any {
        return super.toJSON()
    }
}
