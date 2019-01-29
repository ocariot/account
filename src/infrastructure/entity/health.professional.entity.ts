import { UserEntity } from './user.entity'

export class HealthProfessionalEntity extends UserEntity {
    public children_groups?: Array<string> // List of children group.
}
