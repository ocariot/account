import { UserEntity } from './user.entity'

export class ChildEntity extends UserEntity {
    public gender?: string // Gender of the child. Can be male or female.
    public age?: string  // Age of the child.
    public age_calc_date?: string  // Date the age was registered.
    public last_sync?: Date // Last synchronization time according to the UTC.
    public fitbit_status?: string // Fitbit status value.
    public nfc_tag?: string // NFC tag value.
}
