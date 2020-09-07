import { Institution } from '../../src/application/domain/model/institution'
import { Child, FitbitStatus } from '../../src/application/domain/model/child'

export class ChildMock extends Child {

    constructor() {
        super()
        this.generateChild()
    }

    private generateChild(): void {
        super.id = this.generateObjectId()
        super.username = 'child_mock'
        super.password = 'child_password'
        super.institution = this.generateInstitution()
        super.age = `${Math.floor(Math.random() * 5) + 5}`
        super.gender = this.generateGender()
        super.age_calc_date = '2019-12-01'
        super.last_login = new Date()
        super.last_sync = new Date('2020-01-25T14:40:00Z')
        super.fitbit_status = this.generateFitbitStatus()
        super.nfcTag = '04a22422dd6480'
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

    private generateGender(): string | undefined {
        switch (Math.floor((Math.random() * 2))) { // 0-1
            case 0:
                return GenderMock.MALE
            case 1:
                return GenderMock.FEMALE
        }
    }

    private generateFitbitStatus(): string | undefined {
        switch (Math.floor((Math.random() * 7))) { // 0-6
            case 0:
                return FitbitStatus.VALID_TOKEN
            case 1:
                return FitbitStatus.EXPIRED_TOKEN
            case 2:
                return FitbitStatus.INVALID_TOKEN
            case 3:
                return FitbitStatus.INVALID_GRANT
            case 4:
                return FitbitStatus.INVALID_CLIENT
            case 5:
                return FitbitStatus.SYSTEM
            case 6:
                return FitbitStatus.NONE
        }
    }
}

export enum GenderMock {
    MALE = 'male',
    FEMALE = 'female'
}
