import { UserEntity } from './user.entity'

export class ApplicationEntity extends UserEntity {
    public application_name?: string // Name of application.
}
