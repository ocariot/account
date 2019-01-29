import { UserEntity } from './user.entity'

export class EducatorEntity extends UserEntity {
    public children_groups?: Array<string> // List of children group.
}
