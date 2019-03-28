import { Institution } from '../../src/application/domain/model/institution'
import { Educator } from '../../src/application/domain/model/educator'
import { ChildrenGroupMock } from './children.group.mock'

export class EducatorMock extends Educator {

    constructor() {
        super()
        super.fromJSON(JSON.stringify(this.generateEducator()))
    }

    private generateEducator(): Educator {
        const educator: Educator = new Educator()
        educator.id = this.generateObjectId()
        educator.username = 'educator_mock'
        educator.password = 'password_mock'
        educator.institution = this.generateInstitution()

        educator.children_groups = [new ChildrenGroupMock(), new ChildrenGroupMock()]

        return educator
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
