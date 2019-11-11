import { Institution } from '../../src/application/domain/model/institution'
import { Educator } from '../../src/application/domain/model/educator'
import { ChildrenGroupMock } from './children.group.mock'

export class EducatorMock extends Educator {

    constructor() {
        super()
        this.generateEducator()
    }

    private generateEducator(): void {
        super.id = this.generateObjectId()
        super.username = 'educator_mock'
        super.password = 'educator_password'
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
        institution.latitude = `${Math.random() * 90}`
        institution.longitude = `${Math.random() * 180}`
        return institution
    }
}
