import { Institution } from '../../src/application/domain/model/institution'
import { HealthProfessional } from '../../src/application/domain/model/health.professional'
import { ChildrenGroupMock } from './children.group.mock'

export class HealthProfessionalMock extends HealthProfessional {

    constructor() {
        super()
        this.generateHealthProfessional()
    }

    private generateHealthProfessional(): void {
        super.id = this.generateObjectId()
        super.username = 'health_professional_mock'
        super.password = 'health_professional_password'
        super.institution = this.generateInstitution()
        super.children_groups = [new ChildrenGroupMock(), new ChildrenGroupMock()]
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
        institution.latitude = Math.random() * 90
        institution.longitude = Math.random() * 180
        return institution
    }
}
