import { Entity } from './entity'
import { ISerializable } from '../utils/serializable.interface'

/**
 * Implementation of the institution entity.
 *
 * @extends {Entity}
 * @implements {ISerializable<Institution>}
 */
export class Institution extends Entity implements ISerializable<Institution> {
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

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return {
            id: super.id,
            type: this.type,
            name: this.name,
            address: this.address,
            latitude: this.latitude,
            longitude: this.longitude
        }
    }

    /**
     * Transform JSON into Institution object.
     *
     * @param json
     * @return Institution
     */
    public deserialize(json: any): Institution {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.id !== undefined) super.id = json.id
        if (json.type !== undefined) this.type = json.type
        if (json.name !== undefined) this.name = json.name
        if (json.address !== undefined) this.address = json.address
        if (json.latitude !== undefined) this.latitude = json.latitude
        if (json.longitude !== undefined) this.longitude = json.longitude

        return this
    }
}
