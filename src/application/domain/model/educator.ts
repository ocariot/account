import { User, UserType } from './user'
import { ChildrenGroup } from './children.group'
import { JsonUtils } from '../utils/json.utils'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

/**
 * Implementation of the educator entity.
 *
 * @extends {User}
 * @implements {IJSONSerializable, IJSONDeserializable<Educator>}
 */
export class Educator extends User implements IJSONSerializable, IJSONDeserializable<Educator> {
    private _children_groups?: Array<ChildrenGroup> // List of children group.

    constructor() {
        super()
        super.type = UserType.EDUCATOR
        super.scopes = [
            'children:read',
            'children:readAll',
            'educators:read',
            'educators:update',
            'childrengroups:create',
            'childrengroups:read',
            'childrengroups:update',
            'childrengroups:delete',
            'institutions:read',
            'institutions:readAll',
            'institutions:update',
            'physicalactivities:create',
            'physicalactivities:read',
            'physicalactivities:update',
            'physicalactivities:delete',
            'sleep:create',
            'sleep:read',
            'sleep:update',
            'sleep:delete',
            'measurements:create',
            'measurements:read',
            'measurements:delete',
            'environment:read',
            'childrenphyquest:read',
            'habitsquest:create',
            'habitsquest:read',
            'habitsquest:update',
            'foodhabitsquest:create',
            'foodhabitsquest:read',
            'foodhabitsquest:update',
            'perceptionquest:create',
            'perceptionquest:read',
            'perceptionquest:update',
            'foodtracking:create',
            'foodtracking:read',
            'foodtracking:update',
            'foodtracking:delete',
            'missions:create',
            'missions:read',
            'missions:update',
            'missions:delete',
            'gamificationprofile:create',
            'gamificationprofile:read',
            'gamificationprofile:update',
            'external:sync',
            'notifications:create'
    ]
    }

    get children_groups(): Array<ChildrenGroup> | undefined {
        return this._children_groups
    }

    set children_groups(value: Array<ChildrenGroup> | undefined) {
        this._children_groups = value ? this.removesRepeatedChildrenGroup(value) : value
    }

    public addChildrenGroup(childrenGroup: ChildrenGroup): void {
        if (!this.children_groups) this.children_groups = []
        this.children_groups.push(childrenGroup)
        this.children_groups = this.removesRepeatedChildrenGroup(this.children_groups)
    }

    public removeChildrenGroup(childrenGroup: ChildrenGroup): void {
        if (this.children_groups) {
            this.children_groups = this.children_groups.filter(item => item.id !== childrenGroup.id)
        }
    }

    public removesRepeatedChildrenGroup(childrenGroups: Array<ChildrenGroup>): Array<ChildrenGroup> {
        return childrenGroups.filter((obj, pos, arr) => {
            return arr.map(group => group.id).indexOf(obj.id) === pos
        })
    }

    public fromJSON(json: any): Educator {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.children_groups !== undefined) {
            this.children_groups = json.children_groups
                .map(childrenGroup => new ChildrenGroup().fromJSON(childrenGroup))
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
