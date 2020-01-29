import { assert } from 'chai'
import { CreateChildValidator } from '../../../src/application/domain/validator/create.child.validator'
import { Child, Gender } from '../../../src/application/domain/model/child'
import { Institution } from '../../../src/application/domain/model/institution'
import { ChildMock } from '../../mocks/child.mock'
import { UserTypeMock } from '../../mocks/user.mock'
import { InstitutionMock } from '../../mocks/institution.mock'
import { Strings } from '../../../src/utils/strings'

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
            child.username = undefined

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                    .replace('{0}', 'username'))
            }
        })

        it('should throw an error for does not pass password', () => {
            child.username = 'child'
            child.password = undefined

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                    .replace('{0}', 'password'))
            }
        })

        it('should throw an error for does not pass type', () => {
            child.password = 'child_password'
            child.type = ''

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                    .replace('{0}', 'type'))
            }
        })

        it('should throw an error for does not pass institution', () => {
            child.type = UserTypeMock.CHILD
            child.institution = undefined

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                    .replace('{0}', 'institution'))
            }
        })

        it('should throw an error for pass institution without id', () => {
            child.institution = new Institution()

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                    .replace('{0}', 'institution'))
            }
        })

        it('should throw an error for does not pass gender', () => {
            child.institution = new InstitutionMock()

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'Child validation: gender is required!')
            }
        })

        it('should throw an error for does not pass age', () => {
            child.age = undefined

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                    .replace('{0}', 'age'))
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const emptyChild: Child = new Child()
            emptyChild.type = ''

            try {
                CreateChildValidator.validate(emptyChild)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                    .replace('{0}', 'username, password, type, institution, gender, age'))
            }
        })
    })

    context('when the gender is invalid', () => {
        it('should throw a ValidationException', () => {
            child.gender = 'invalid_gender'

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                assert.equal(err.description, 'The names of the allowed genders are: male, female.')
            }
        })
    })

    context('when the age is invalid', () => {
        it('should throw a ValidationException', () => {
            child.gender = Gender.MALE
            child.age = '-1'

            try {
                CreateChildValidator.validate(child)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                assert.equal(err.description,
                    'Age cannot be less than or equal to zero!')
            }
        })
    })
})
