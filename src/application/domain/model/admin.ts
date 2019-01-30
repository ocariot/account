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

        super.scopes = [
            'educators:create',
            'educators:read',
            'educators:update',
            'educators:delete',
            'families:create',
            'families:read',
            'families:update',
            'families:delete',
            'children:create',
            'children:read',
            'children:update',
            'children:delete',
            'healthprofessionals:create',
            'healthprofessionals:read',
            'healthprofessionals:update',
            'healthprofessionals:delete',
            'applications:create',
            'applications:read',
            'applications:update',
            'applications:delete',
            'questionnaires:read',
            'foodrecord:read',
            'physicalactivities:read',
            'sleep:read',
            'environment:read',
            'missions:read',
            'gamificationprofile :read'
        ]
    }

    public fromJSON(json: any): Admin {
        super.fromJSON(json)

        return this
    }

    public toJSON(): any {
        return super.toJSON()
    }
}
