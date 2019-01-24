import { ISerializable } from '../utils/serializable.interface'
import { Entity } from './entity'
import { Child } from './child'
import { JsonUtils } from '../utils/json.utils'

/**
 * Implementation of the children group entity.
 *
 * @extends {Entity}
 * @implements {ISerializable<ChildrenGroup>}
 */
export class ChildrenGroup extends Entity implements ISerializable<ChildrenGroup> {
    private _name?: string
    private _children?: Array<Child>
    private _school_class?: string

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
        this._children = value
    }

    get school_class(): string | undefined {
        return this._school_class
    }

    set school_class(value: string | undefined) {
        this._school_class = value
    }

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return {
            id: super.id,
            name: this.name,
            children: this.children ? this.children.map(item => item.serialize()) : this.children,
            school_class: this.school_class
        }
    }

    /**
     * Transform JSON into ChildrenGroup object.
     *
     * @param json
     * @return ChildrenGroup
     */
    public deserialize(json: any): ChildrenGroup {
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
        if (json.children !== undefined) {
            const childrenTemp: Array<Child> = []
            json.children.forEach(elem => childrenTemp.push(new Child().deserialize(elem)))
            this.children = childrenTemp
        }
        if (json.school_class !== undefined) this.school_class = json.school_class

        return this
    }
}
