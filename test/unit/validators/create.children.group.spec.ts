import { CreateChildrenGroupValidator } from '../../../src/application/domain/validator/create.children.group.validator'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { User } from '../../../src/application/domain/model/user'
import { ObjectID } from 'bson'
import { Child } from '../../../src/application/domain/model/child'
import { expect } from 'chai'

describe('Validators: ChildrenGroup', () => {
    const user: User = new User()
    user.id = `${new ObjectID()}`

    const child: Child = new Child()
    child.id = `${new ObjectID()}`

    it('should return undefined when the validation was successful', () => {
        const childrenGroup: ChildrenGroup = new ChildrenGroup()
        childrenGroup.name = 'ChildrenGroupTest'
        childrenGroup.school_class = '4th Grade'
        childrenGroup.user = user
        childrenGroup.children = [child]

        const result = CreateChildrenGroupValidator.validate(childrenGroup)
        expect(result).is.undefined
    })

    context('when the children group was incomplete', () => {
        it('should throw an error for does not pass children collection', () => {
            const childrenGroup: ChildrenGroup = new ChildrenGroup()
            childrenGroup.name = 'ChildrenGroupTest'
            childrenGroup.school_class = '4th Grade'
            childrenGroup.user = user

            try {
                CreateChildrenGroupValidator.validate(childrenGroup)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Children Group validation: Collection with children IDs is required!')
            }
        })

        it('should throw an error for does pass empty children collection', () => {
            const childrenGroup: ChildrenGroup = new ChildrenGroup()
            childrenGroup.name = 'ChildrenGroupTest'
            childrenGroup.school_class = '4th Grade'
            childrenGroup.user = user
            childrenGroup.children = []

            try {
                CreateChildrenGroupValidator.validate(childrenGroup)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Children Group validation: Collection with children IDs is required!')
            }
        })
    })
})
