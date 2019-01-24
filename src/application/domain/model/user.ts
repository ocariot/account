import { Entity } from './entity'
import { ISerializable } from '../utils/serializable.interface'
import { Institution } from './institution'
import { JsonUtils } from '../utils/json.utils'

/**
 * Implementation of the user entity.
 *
 * @extends {Entity}
 * @implements {ISerializable<User>}
 */
export class User extends Entity implements ISerializable<User> {
    private _username?: string // Username for user authentication.
    private _password?: string // Password for user authentication.
    private _type?: string // Type of user. Can be Child, Educator, Health Professional or Family.
    private _institution?: Institution // Institution to which the user belongs.

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

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return {
            id: super.id,
            username: this.username,
            type: this.type,
            institution: this.institution ? this.institution.serialize() : this.institution
        }
    }

    /**
     * Transform JSON into User object.
     *
     * @param json
     * @return User
     */
    public deserialize(json: any): User {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.username !== undefined) this.username = json.username
        if (json.password !== undefined) this.password = json.password
        if (json.type !== undefined) this.type = json.type
        if (json.institution !== undefined) {
            this.institution = new Institution().deserialize(json.institution)
        } else if (json.institution_id !== undefined) {
            this.institution = new Institution().deserialize(json)
        }

        return this
    }
}

/**
 * Names of user types supported.
 */
export enum UserType {
    CHILD = 'child',
    EDUCATOR = 'educator',
    HEALTH_PROFESSIONAL = 'healthprofessional',
    FAMILY = 'family',
    APPLICATION = 'application'
}
