import { ISerializable } from '../utils/serializable.interface'
import { User, UserType } from './user'
import { ChildrenGroup } from './children.group'
import { JsonUtils } from '../utils/json.utils'

/**
 * Implementation of the educator entity.
 *
 * @extends {User}
 * @implements {ISerializable<Educator>}
 */
export class Educator extends User implements ISerializable<Educator> {
    private _children_groups?: Array<ChildrenGroup> // List of children group.

    constructor() {
        super()
        super.type = UserType.EDUCATOR
    }

    get children_groups(): Array<ChildrenGroup> | undefined {
        return this._children_groups
    }

    set children_groups(value: Array<ChildrenGroup> | undefined) {
        this._children_groups = value
    }

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return Object.assign(super.serialize(), {
            children_groups: this.children_groups ?
                this.children_groups.map(item => item.serialize()) :
                this.children_groups
        })
    }

    /**
     * Transform JSON into Educator object.
     *
     * @param json
     * @return Educator
     */
    public deserialize(json: any): Educator {
        if (!json) return this
        super.deserialize(json)

        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.children_groups !== undefined) {
            const childrenGroupsTemp: Array<ChildrenGroup> = []
            json.children_groups.forEach(elem => {
                childrenGroupsTemp.push(new ChildrenGroup().deserialize(elem))
            })
            this.children_groups = childrenGroupsTemp
        }

        return this
    }
}
