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
            'users:delete',
            'educators:create',
            'educators:read',
            'educators:readAll',
            'educators:update',
            'educators:delete',
            'families:create',
            'families:read',
            'families:update',
            'families:delete',
            'families:readAll',
            'children:create',
            'children:read',
            'children:readAll',
            'children:update',
            'children:delete',
            'healthprofessionals:create',
            'healthprofessionals:read',
            'healthprofessionals:readAll',
            'healthprofessionals:update',
            'healthprofessionals:delete',
            'applications:create',
            'applications:read',
            'applications:readAll',
            'applications:update',
            'applications:delete',
            'questionnaires:read',
            'foodrecord:read',
            'physicalactivities:read',
            'physicalactivities:readAll',
            'sleep:read',
            'sleep:readAll',
            'environment:read',
            'missions:read',
            'gamificationprofile:read',
            'children:readAll'
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
