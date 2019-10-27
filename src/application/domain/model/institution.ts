import { Entity } from './entity'
import { JsonUtils } from '../utils/json.utils'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

/**
 * Implementation of the institution entity.
 *
 * @extends {Entity}
 * @implements {IJSONSerializable, IJSONDeserializable<Institution>}
 */
export class Institution extends Entity implements IJSONSerializable, IJSONDeserializable<Institution> {
    private _type?: string // Type of institution, for example: Institute of Scientific Research.
    private _name?: string // Name of institution.
    private _address?: string // Address of institution.
    private _latitude?: number // Latitude from place's geolocation, for example: -7.2100766.
    private _longitude?: number // Longitude from place's geolocation, for example: -35.9175756.

    constructor() {
        super()
    }

    get type(): string | undefined {
        return this._type
    }

    set type(value: string | undefined) {
        this._type = value
    }

    get name(): string | undefined {
        return this._name
    }

    set name(value: string | undefined) {
        this._name = value
    }

    get address(): string | undefined {
        return this._address
    }

    set address(value: string | undefined) {
        this._address = value
    }

    get latitude(): number | undefined {
        return this._latitude
    }

    set latitude(value: number | undefined) {
        this._latitude = value
    }

    get longitude(): number | undefined {
        return this._longitude
    }

    set longitude(value: number | undefined) {
        this._longitude = value
    }

    public fromJSON(json: any): Institution {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.institution_id !== undefined) {
            super.id = json.institution_id ? json.institution_id : undefined
            return this
        }

        if (json.id !== undefined) super.id = json.id
        if (json.type !== undefined) this.type = json.type
        if (json.name !== undefined) this.name = json.name
        if (json.address !== undefined) this.address = json.address
        if (json.latitude !== undefined) this.latitude = json.latitude
        if (json.longitude !== undefined) this.longitude = json.longitude

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            type: this.type,
            name: this.name,
            address: this.address,
            latitude: this.latitude,
            longitude: this.longitude
        }
    }
}
