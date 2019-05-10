import { UserEntity } from './user.entity'

export class FamilyEntity extends UserEntity {
    public children?: Array<string> // List of IDs of children associated with a family.
}
