import { User, UserType } from './user'
import { JsonUtils } from '../utils/json.utils'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

/**
 * Implementation of the child entity.
 *
 * @extends {User}
 * @implements { IJSONSerializable, IJSONDeserializable<Child>}
 */
export class Child extends User implements IJSONSerializable, IJSONDeserializable<Child> {
    private _gender?: string // Gender of the child. Can be male or female.
    private _age?: number  // Age of the child.
    private _last_sync?: Date // Last synchronization time according to the UTC.

    constructor() {
        super()
        super.type = UserType.CHILD
        super.scopes = [
            'children:read',
            'institutions:read',
            'questionnaires:create',
            'questionnaires:read',
            'foodrecord:create',
            'foodrecord:read',
            'physicalactivities:create',
            'physicalactivities:read',
            'sleep:create',
            'sleep:read',
            'measurements:create',
            'measurements:read',
            'environment:read',
            'missions:read',
            'gamificationprofile:read',
            'gamificationprofile:update'
        ]
    }

    get gender(): string | undefined {
        return this._gender
    }

    set gender(value: string | undefined) {
        this._gender = value
    }

    get age(): number | undefined {
        return this._age
    }

    set age(value: number | undefined) {
        this._age = value
    }

    get last_sync(): Date | undefined {
        return this._last_sync
    }

    set last_sync(value: Date | undefined) {
        this._last_sync = value
    }

    public fromJSON(json: any): Child {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string') {
            if (!JsonUtils.isJsonString(json)) {
                super.id = json
                return this
            } else {
                json = JSON.parse(json)
            }
        }
        if (json.gender !== undefined) this.gender = json.gender
        if (json.age !== undefined) this.age = json.age
        if (json.last_sync !== undefined && !(json.last_sync instanceof Date)) {
            this.last_sync = this.convertDatetimeString(json.last_sync)
        } else {
            this.last_sync = json.last_sync
        }

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                gender: this.gender,
                age: this.age,
                last_sync: this.last_sync
            }
        }
    }
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female'
}
