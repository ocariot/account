import { assert } from 'chai'
import { CreateChildValidator } from '../../../src/application/domain/validator/create.child.validator'
import { Child, Gender } from '../../../src/application/domain/model/child'
import { Institution } from '../../../src/application/domain/model/institution'
import { ChildMock } from '../../mocks/child.mock'
import { UserTypeMock } from '../../mocks/user.mock'
import { InstitutionMock } from '../../mocks/institution.mock'

describe('Validators: Child', () => {
    const child: Child = new ChildMock()
    child.password = 'child_password'

    context('when the validation was successful', () => {
        it('should return undefined', () => {
            const result = CreateChildValidator.validate(child)
            assert.equal(result, undefined)
        })
    })

    context('when the child was incomplete', () => {
        it('should throw an error for does not pass username', () => {
            child.username = ''

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Child validation: username is required!')
            }
        })

        it('should throw an error for does not pass password', () => {
            child.username = 'child'
            child.password = ''

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Child validation: password is required!')
            }
        })

        it('should throw an error for does not pass type', () => {
            child.password = 'child_password'
            child.type = ''

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Child validation: type is required!')
            }
        })

        it('should throw an error for does not pass institution', () => {
            child.type = UserTypeMock.CHILD
            child.institution = undefined

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Child validation: institution is required!')
            }
        })

        it('should throw an error for pass institution without id', () => {
            child.institution = new Institution()

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Child validation: institution is required!')
            }
        })

        it('should throw an error for does not pass gender', () => {
            child.institution = new InstitutionMock()

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Child validation: gender is required!')
            }
        })

        it('should throw an error for does not pass age', () => {
            child.age = undefined

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Child validation: age is required!')
            }
        })

        it('should throw an error for does not pass age', () => {
            child.gender = 'male'
            child.age = undefined

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Child validation: age is required!')
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const emptyChild: Child = new Child()
            emptyChild.type = ''

            try {
                CreateChildValidator.validate(emptyChild)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Child validation: username, ' +
                    'password, type, institution, gender, age is required!')
            }
        })
    })

    context('when the gender is invalid', () => {
        it('should throw a ValidationException', () => {
            child.gender = 'invalid_gender'

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, 'The gender provided "invalid_gender" is not supported...')
                assert.equal(err.description, 'The names of the allowed genders are: female, male.')
            }
        })
    })

    context('when the age is invalid', () => {
        it('should throw a ValidationException', () => {
            child.gender = Gender.MALE
            child.age = -1

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, 'Age field is invalid...')
                assert.equal(err.description,
                    'Child validation: The age parameter can only contain a value greater than zero')
            }
        })
    })
})
