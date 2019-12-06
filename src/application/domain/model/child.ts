import { User, UserType } from './user'
import { JsonUtils } from '../utils/json.utils'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { DatetimeValidator } from '../validator/datetime.validator'

/**
 * Implementation of the child entity.
 *
 * @extends {User}
 * @implements { IJSONSerializable, IJSONDeserializable<Child>}
 */
export class Child extends User implements IJSONSerializable, IJSONDeserializable<Child> {
    private _gender?: string // Gender of the child. Can be male or female.
    private _age?: string  // Age of the child.
    private _age_calc_date?: string // Date the age was registered.
    private _last_sync?: Date // Last synchronization time according to the UTC.
    private _fitbit_status?: string // Fitbit status value.
    private _cve_status?: string // CVE status value.

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
            'gamificationprofile:update',
            'external:sync'
        ]
        this.fitbit_status = 'none'
        this.cve_status = 'none'
    }

    get gender(): string | undefined {
        return this._gender
    }

    set gender(value: string | undefined) {
        this._gender = value
    }

    get age(): string | undefined {
        return this._age
    }

    set age(value: string | undefined) {
        this._age = value
    }

    get age_calc_date(): string | undefined {
        return this._age_calc_date
    }

    set age_calc_date(value: string | undefined) {
        this._age_calc_date = value
    }

    get last_sync(): Date | undefined {
        return this._last_sync
    }

    set last_sync(value: Date | undefined) {
        this._last_sync = value
    }

    get fitbit_status(): string | undefined {
        return this._fitbit_status
    }

    set fitbit_status(value: string | undefined) {
        this._fitbit_status = value
    }

    get cve_status(): string | undefined {
        return this._cve_status
    }

    set cve_status(value: string | undefined) {
        this._cve_status = value
    }

    public convertDatetimeString(value: string): Date {
        DatetimeValidator.validate(value)
        return new Date(value)
    }

    public fromJSON(json: any): Child {
        if (!json || json === 'null') return this
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
        if (json.age_calc_date !== undefined) this.age_calc_date = json.age_calc_date

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                gender: this.gender,
                age: this.age,
                age_calc_date: this.age_calc_date,
                last_sync: this.last_sync,
                fitbit_status: this.fitbit_status,
                cve_status: this.cve_status
            }
        }
    }
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female'
}

export enum FitbitStatus {
    VALID_TOKEN = 'valid_token',
    EXPIRED_TOKEN = 'expired_token',
    INVALID_TOKEN = 'invalid_token',
    INVALID_GRANT = 'invalid_grant',
    INVALID_CLIENT = 'invalid_client',
    SYSTEM = 'rate_limit',
    NONE = 'none'
}
