import { ISerializable } from '../utils/serializable.interface'
import { Institution } from './institution'
import { User, UserType } from './user'

/**
 * Implementation of the child entity.
 *
 * @extends {User}
 * @implements {ISerializable<Child>}
 */
export class Child extends User implements ISerializable<Child> {
    private _gender?: string // Gender of the child.
    private _age?: number  // Age of the child. Can be male or female

    constructor() {
        super()
        super.type = UserType.CHILD
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

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return {
            id: super.id,
            username: super.username,
            gender: this.gender,
            age: this.age,
            institution: super.institution ? super.institution.serialize() : super.institution
        }
    }

    /**
     * Transform JSON into Child object.
     *
     * @param json
     * @return Child
     */
    public deserialize(json: any): Child {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.id !== undefined) super.id = json.id
        if (json.username !== undefined) super.username = json.username
        if (json.password !== undefined) super.password = json.password
        if (json.gender !== undefined) this.gender = json.gender
        if (json.age !== undefined) this.age = json.age
        if (json.institution !== undefined) {
            super.institution = new Institution().deserialize(json.institution)
        } else if (json.institution_id !== undefined) {
            const institution = new Institution()
            institution.id = json.institution_id
            super.institution = institution
        }

        return this
    }
}
