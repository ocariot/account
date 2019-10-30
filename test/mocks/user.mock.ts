import { User } from '../../src/application/domain/model/user'
import { Institution } from '../../src/application/domain/model/institution'

export class UserMock extends User {

    constructor(type?: UserTypeMock) {
        super()
        this.generateUser(type)
    }

    private generateUser(type?: UserTypeMock): void {
        if (!type) type = this.chooseType()

        super.id = this.generateObjectId()
        super.username = 'user_mock'
        super.password = 'user_password'
        super.type = type
        super.institution = this.generateInstitution()
        super.scopes = new Array<string>('readonly')
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

    private chooseType(): UserTypeMock {
        switch (Math.floor((Math.random() * 5))) { // 0-4
            case 0:
                return UserTypeMock.CHILD
            case 1:
                return UserTypeMock.EDUCATOR
            case 2:
                return UserTypeMock.HEALTH_PROFESSIONAL
            case 3:
                return UserTypeMock.FAMILY
            default:
                return UserTypeMock.APPLICATION
        }
    }
}

/**
 * Names of user types supported of mock.
 */
export enum UserTypeMock {
    ADMIN = 'admin',
    CHILD = 'child',
    EDUCATOR = 'educator',
    HEALTH_PROFESSIONAL = 'healthprofessional',
    FAMILY = 'family',
    APPLICATION = 'application'
}
