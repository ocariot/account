export class ChildrenGroupEntity {
    public id?: string
    public name?: string // Name of the children group.
    public children?: Array<string> // List of IDs of children associated with a family.
    public school_class?: string // Class of the children from group.
    public user_id?: string // The user to whom the children group belongs: The possible users are Educator or Health Professional
}
