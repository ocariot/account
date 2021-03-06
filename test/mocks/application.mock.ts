import { Institution } from '../../src/application/domain/model/institution'
import { Application } from '../../src/application/domain/model/application'

export class ApplicationMock extends Application {

    constructor() {
        super()
        this.generateApplication()
    }

    private generateApplication(): void {
        super.id = this.generateObjectId()
        super.username = 'application_mock'
        super.password = 'application_password'
        super.institution = this.generateInstitution()
        super.application_name = 'application test'
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    private generateInstitution(): Institution {
        const institution = new Institution()
        institution.id = this.generateObjectId()
        institution.type = 'Institute of Scientific Research'
        institution.name = 'Name Example'
        institution.address = '221B Baker Street, St.'
        institution.latitude = `${Math.random() * 90}`
        institution.longitude = `${Math.random() * 180}`
        return institution
    }
}
