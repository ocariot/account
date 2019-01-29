import { User, UserType } from './user'
import { ChildrenGroup } from './children.group'
import { JsonUtils } from '../utils/json.utils'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

/**
 * Implementation of the educator entity.
 *
 * @extends {User}
 * @implements {ISerializable<Educator>}
 */
export class Educator extends User implements IJSONSerializable, IJSONDeserializable<Educator> {
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

    public fromJSON(json: any): Educator {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.children_groups !== undefined) {
            const childrenGroupsTemp: Array<ChildrenGroup> = []
            json.children_groups.forEach(elem => {
                childrenGroupsTemp.push(new ChildrenGroup().fromJSON(elem))
            })
            this.children_groups = childrenGroupsTemp
        }

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                children_groups: this.children_groups ?
                    this.children_groups.map(item => item.toJSON()) :
                    this.children_groups
            }
        }
    }
}
