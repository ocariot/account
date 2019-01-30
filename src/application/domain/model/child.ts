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
    private _gender?: string // Gender of the child.
    private _age?: number  // Age of the child. Can be male or female

    constructor() {
        super()
        super.type = UserType.CHILD
        super.scope = [
            'questionnaires:read',
            'questionnaires:create'
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

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{ gender: this.gender, age: this.age }
        }
    }
}
