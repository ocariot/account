import { ISerializable } from '../utils/serializable.interface'
import { User, UserType } from './user'
import { JsonUtils } from '../utils/json.utils'

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
        return Object.assign(super.serialize(), {
            gender: this.gender,
            age: this.age
        })
    }

    /**
     * Transform JSON into Child object.
     *
     * @param json
     * @return Child
     */
    public deserialize(json: any): Child {
        if (!json) return this
        super.deserialize(json)

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

        return this
    }
}
