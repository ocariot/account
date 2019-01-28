export class UserEntity {
    public id?: string
    public username?: string // Username for user authentication.
    public password?: string // Password for user authentication.
    public type?: string // Type of user. Can be Child, Educator, Health Professional or Family.
    public institution?: string // Institution ID to which the user belongs.
    public scope!: string // Scope that signal the types of access the user has.
}
