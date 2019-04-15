import { ChildrenGroup } from '../../src/application/domain/model/children.group'
import { ChildMock } from './child.mock'
import { UserMock } from './user.mock'

export class ChildrenGroupMock extends ChildrenGroup {
    constructor() {
        super()
        this.generateChildrenGroup()
    }

    private generateChildrenGroup(): void {
        super.id = this.generateObjectId()
        super.name = 'children group 1'
        super.children = [new ChildMock(), new ChildMock()]
        super.school_class = 'Room 01'
        super.user = new UserMock()
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }
}
