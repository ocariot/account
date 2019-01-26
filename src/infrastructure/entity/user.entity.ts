export class UserEntity {
    public id?: string
    public username?: string // Username for user authentication.
    public password?: string // Password for user authentication.
    public type?: string // Type of user. Can be Child, Educator, Health Professional or Family.
    public institution?: string // Institution ID to which the user belongs.
    public gender?: string // Gender of the child.
    public age?: number  // Age of the child. Can be male or female
    // public children?: Array<string> // List of IDs of children associated with a family.
    // public children_groups?: Array<string> // List of children group IDs.
    // public application_name?: string // Name of application.
}
