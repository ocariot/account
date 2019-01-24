import { ISerializable } from '../utils/serializable.interface'
import { User, UserType } from './user'
import { Child } from './child'
import { JsonUtils } from '../utils/json.utils'

/**
 * Implementation of the family entity.
 *
 * @extends {User}
 * @implements {ISerializable<Family>}
 */
export class Family extends User implements ISerializable<Family> {
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

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return Object.assign(super.serialize(), {
            children: this.children ? this.children.map(item => item.serialize()) : this.children
        })
    }

    /**
     * Transform JSON into Family object.
     *
     * @param json
     * @return Family
     */
    public deserialize(json: any): Family {
        if (!json) return this
        super.deserialize(json)

        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.children !== undefined) {
            const childrenTemp: Array<Child> = []
            json.children.forEach(elem => childrenTemp.push(new Child().deserialize(elem)))
            this.children = childrenTemp
        }

        return this
    }
}
