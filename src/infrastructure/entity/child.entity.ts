import { UserEntity } from './user.entity'

export class ChildEntity extends UserEntity {
    public gender?: string // Gender of the child.
    public age?: number  // Age of the child. Can be male or female
    public last_sync?: Date // Last synchronization time according to the UTC.
    public fitbit_status?: string // Fitbit status value.
    public cve_status?: string // CVE status value.
}
