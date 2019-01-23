import { ISerializable } from '../utils/serializable.interface'
import { Institution } from './institution'
import { User, UserType } from './user'
import { Child } from './child'

/**
 * Implementation of the educator entity.
 *
 * @extends {User}
 * @implements {ISerializable<Educator>}
 */
export class Educator extends User implements ISerializable<Educator> {
    private _children?: Array<Child> // List of children associated with a family.

    constructor(username?: string, password?: string, institution?: Institution,
                gender?: string, age?: number, children?: Array<Child>, id?: string) {
        super(username, password, UserType.FAMILY, institution, id)
        this.children = children
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
        return {
            id: super.id,
            username: super.username,
            children: this.children ? this.children.map(item => item.serialize()) : this.children,
            institution: super.institution ? super.institution.serialize() : super.institution
        }
    }

    /**
     * Transform JSON into Educator object.
     *
     * @param json
     * @return Educator
     */
    public deserialize(json: any): Educator {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.id !== undefined) super.id = json.id
        if (json.username !== undefined) super.username = json.username
        if (json.password !== undefined) super.password = json.password
        if (json.institution !== undefined) {
            super.institution = new Institution().deserialize(json.institution)
        } else if (json.institution_id !== undefined) {
            const institution = new Institution()
            institution.id = json.institution_id
            super.institution = institution
        }

        return this
    }
}
