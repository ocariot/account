import { Entity } from './entity'
import { Child } from './child'
import { JsonUtils } from '../utils/json.utils'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { User } from './user'

/**
 * Implementation of the children group entity.
 *
 * @extends {Entity}
 * @implements { IJSONSerializable, IJSONDeserializable<ChildrenGroup>}
 */
export class ChildrenGroup extends Entity implements IJSONSerializable, IJSONDeserializable<ChildrenGroup> {
    private _name?: string // Name of the children group.
    private _children?: Array<Child> // Children belonging to the group.
    private _school_class?: string // Class of the children from group.
    private _user?: User // The user to whom the children group belongs: The possible users are Educator or Health Professional

    constructor() {
        super()
    }

    get name(): string | undefined {
        return this._name
    }

    set name(value: string | undefined) {
        this._name = value
    }

    get children(): Array<Child> | undefined {
        return this._children
    }

    set children(value: Array<Child> | undefined) {
        this._children = value && value instanceof Array ? this.removesRepeatedChildren(value) : value
    }

    get school_class(): string | undefined {
        return this._school_class
    }

    set school_class(value: string | undefined) {
        this._school_class = value
    }

    get user(): User | undefined {
        return this._user
    }

    set user(value: User | undefined) {
        this._user = value
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

    public fromJSON(json: any): ChildrenGroup {
        if (!json) return this
        if (typeof json === 'string') {
            if (!JsonUtils.isJsonString(json)) {
                super.id = json
                return this
            } else {
                json = JSON.parse(json)
            }
        }

        if (json.id !== undefined) super.id = json.id
        if (json.name !== undefined) this.name = json.name
        if (json.school_class !== undefined) this.school_class = json.school_class
        if (json.children !== undefined) {
            if (json.children instanceof Array) this.children = json.children.map(child => new Child().fromJSON(child))
            else this.children = json.children
        }

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            name: this.name,
            children: this.children ?
                this.children.map(child => {
                    child.toJSON()
                    child.type = undefined
                    return child
                }) :
                this.children,
            school_class: this.school_class
        }
    }
}
