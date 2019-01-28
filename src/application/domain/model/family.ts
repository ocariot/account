import { User, UserType } from './user'
import { Child } from './child'
import { JsonUtils } from '../utils/json.utils'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

/**
 * Implementation of the family entity.
 *
 * @extends {User}
 * @implements {ISerializable<Family>}
 */
export class Family extends User implements IJSONSerializable, IJSONDeserializable<Family> {
    private _children?: Array<Child> // List of children associated with a family.

    constructor() {
        super()
        super.type = UserType.FAMILY
    }

    get children(): Array<Child> | undefined {
        return this._children
    }

    set children(value: Array<Child> | undefined) {
        this._children = value
    }

    public toJSON(): any {
        return Object.assign(super.toJSON(), {
            children: this.children ? this.children.map(item => item.toJSON()) : this.children
        })
    }

    public fromJSON(json: any): Family {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.children !== undefined) {
            this.children = json.children.map(item => new Child().fromJSON(item))
        }

        return this
    }
}
