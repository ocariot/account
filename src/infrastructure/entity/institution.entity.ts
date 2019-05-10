export class InstitutionEntity {
    public id?: string
    public type?: string // Type of institution, for example: Institute of Scientific Research.
    public name?: string // Name of institution.
    public address?: string // Address of institution.
    public latitude?: number // Latitude from place's geolocation, for example: -7.2100766.
    public longitude?: number // Longitude from place's geolocation, for example: -35.9175756.
}
