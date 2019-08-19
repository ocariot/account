import { User, UserType } from './user'
import { Child } from './child'
import { JsonUtils } from '../utils/json.utils'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

/**
 * Implementation of the family entity.
 *
 * @extends {User}
 * @implements {IJSONSerializable, IJSONDeserializable<Family>}
 */
export class Family extends User implements IJSONSerializable, IJSONDeserializable<Family> {
    private _children?: Array<Child> // List of children associated with a family.

    constructor() {
        super()
        super.type = UserType.FAMILY
        super.scopes = [
            'families:read',
            'families:update',
            'institutions:read',
            'questionnaires:create',
            'questionnaires:read',
            'questionnaires:update',
            'questionnaires:delete',
            'foodrecord:create',
            'foodrecord:read',
            'foodrecord:update',
            'foodrecord:delete',
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
            'missions:read',
            'gamificationprofile:read'
        ]
    }

    get children(): Array<Child> | undefined {
        return this._children
    }

    set children(value: Array<Child> | undefined) {
        this._children = value ? this.removesRepeatedChildren(value) : value
    }

    public addChild(child: Child): void {
        if (!this.children) this.children = []
        this.children.push(child)
        this.children = this.removesRepeatedChildren(this.children)
    }

    public removesRepeatedChildren(children: Array<Child>): Array<Child> {
        return children.filter((obj, pos, arr) => {
            return arr.map(group => group.id).indexOf(obj.id) === pos
        })
    }

    public fromJSON(json: any): Family {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.children !== undefined && json.children instanceof Array) {
            this.children = json.children.map(child => new Child().fromJSON(child))
        }

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                children: this.children ?
                    this.children.map(child => {
                        child.toJSON()
                        child.type = undefined
                        child.gender = undefined
                        child.age = undefined
                        child.last_login = undefined
                        child.last_sync = undefined
                        return child
                    }) :
                    this.children
            }
        }
    }
}
