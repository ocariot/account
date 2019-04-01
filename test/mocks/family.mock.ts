import { Institution } from '../../src/application/domain/model/institution'
import { Family } from '../../src/application/domain/model/family'
import { ChildMock } from './child.mock'

export class FamilyMock extends Family {

    constructor() {
        super()
        super.fromJSON(JSON.stringify(this.generateFamily()))
    }

    private generateFamily(): Family {
        const family: Family = new Family()
        family.id = this.generateObjectId()
        family.username = 'family_mock'
        family.password = 'password_mock'
        family.institution = this.generateInstitution()
        family.children = [new ChildMock(), new ChildMock()]

        return family
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
