import { UserEntity } from './user.entity'

export class ChildEntity extends UserEntity {
    public gender?: string // Gender of the child.
    public age?: number  // Age of the child. Can be male or female
}