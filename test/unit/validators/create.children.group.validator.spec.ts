import { assert } from 'chai'
import { CreateChildrenGroupValidator } from '../../../src/application/domain/validator/create.children.group.validator'
import { ChildrenGroup } from '../../../src/application/domain/model/children.group'
import { ChildrenGroupMock } from '../../mocks/children.group.mock'
import { UserMock } from '../../mocks/user.mock'
import { Child } from '../../../src/application/domain/model/child'
import { ChildMock } from '../../mocks/child.mock'

describe('Validators: ChildrenGroup', () => {
    const childrenGroup: ChildrenGroup = new ChildrenGroupMock()
    childrenGroup.user = new UserMock()

    context('when the validation was successful', () => {
        it('should return undefined', () => {
            const result = CreateChildrenGroupValidator.validate(childrenGroup)
            assert.equal(result, undefined)
        })
    })

    context('when the children group was incomplete', () => {
        it('should throw an error  for does not pass user', () => {
            childrenGroup.user = undefined

            try {
                CreateChildrenGroupValidator.validate(childrenGroup)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Children Group validation: user is required!')
            }
        })

        it('should throw an error for does not pass children collection', () => {
            childrenGroup.user = new UserMock()
            childrenGroup.children = []

            try {
                CreateChildrenGroupValidator.validate(childrenGroup)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Children Group validation: Collection with children IDs is required!')
            }
        })

        it('should throw an error for does pass the children collection with some child without id', () => {
            const child: Child = new ChildMock()
            child.id = ''
            childrenGroup.children = [child]

            try {
                CreateChildrenGroupValidator.validate(childrenGroup)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Children Group validation: Collection with children IDs ' +
                    '(ID can not be empty) is required!')
            }
        })

        it('should throw an error for does not pass any of the required parameters', () => {
            const emptyChildrenGroup: ChildrenGroup = new ChildrenGroup()

            try {
                CreateChildrenGroupValidator.validate(emptyChildrenGroup)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Children Group validation: name, user, Collection with children IDs ' +
                    'is required!')
            }
        })
    })
})
