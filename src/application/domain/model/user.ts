import { Entity } from './entity'
import { Institution } from './institution'
import { JsonUtils } from '../utils/json.utils'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { DatetimeValidator } from '../validator/datetime.validator'

/**
 * Implementation of the user entity.
 *
 * @extends {Entity}
 * @implements {IJSONSerializable, IJSONDeserializable<User>}
 */
export class User extends Entity implements IJSONSerializable, IJSONDeserializable<User> {
    private _username?: string // Username for user authentication.
    private _password?: string // Password for user authentication.
    private _type?: string // Type of user. Can be Child, Educator, Health Professional or Family.
    private _institution?: Institution // Institution to which the user belongs.
    private _last_login?: Date // Last login time according to the UTC.
    private _scopes!: Array<string> // Scope that signal the types of access the user has.

    constructor() {
        super()
    }

    get username(): string | undefined {
        return this._username
    }

    set username(value: string | undefined) {
        this._username = value
    }

    get password(): string | undefined {
        return this._password
    }

    set password(value: string | undefined) {
        this._password = value
    }

    get type(): string | undefined {
        return this._type
    }

    set type(value: string | undefined) {
        this._type = value
    }

    get institution(): Institution | undefined {
        return this._institution
    }

    set institution(value: Institution | undefined) {
        this._institution = value
    }

    get last_login(): Date | undefined {
        return this._last_login
    }

    set last_login(value: Date | undefined) {
        this._last_login = value
    }

    get scopes(): Array<string> {
        return this._scopes
    }

    set scopes(value: Array<string>) {
        this._scopes = value
    }

    public addScope(scope: string): void {
        if (!this.scopes) this._scopes = []
        if (scope) this._scopes.push(scope)
    }

    public removeScope(scope: string): void {
        if (scope) {
            this.scopes = this.scopes.filter(item => item !== scope)
        }
    }

    public convertDatetimeString(value: string): Date {
        DatetimeValidator.validate(value)
        return new Date(value)
    }

    public fromJSON(json: any): User {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.username !== undefined) this.username = json.username
        if (json.password !== undefined) this.password = json.password
        if (json.institution !== undefined) {
            this.institution = new Institution()
            this.institution.id = json.institution
        } else if (json.institution_id !== undefined) {
            this.institution = new Institution().fromJSON(json)
        }
        if (json.last_login !== undefined && !(json.last_login instanceof Date)) {
            this.last_login = this.convertDatetimeString(json.last_login)
        } else if (json.last_login !== undefined && json.last_login instanceof Date) {
            this.last_login = json.last_login
        }
        if (json.scope !== undefined) this.scopes = json.scope

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            username: this.username,
            type: this.type,
            institution_id: this.institution ? this.institution.id : undefined,
            last_login: this.last_login
        }
    }
}

/**
 * Names of user types supported.
 */
export enum UserType {
    ADMIN = 'admin',
    CHILD = 'child',
    EDUCATOR = 'educator',
    HEALTH_PROFESSIONAL = 'healthprofessional',
    FAMILY = 'family',
    APPLICATION = 'application'
}
