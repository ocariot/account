import { Institution } from '../../../src/application/domain/model/institution'
import { assert } from 'chai'
import { CreateEducatorValidator } from '../../../src/application/domain/validator/create.educator.validator'
import { Educator } from '../../../src/application/domain/model/educator'
import { EducatorMock } from '../../mocks/educator.mock'
import { UserTypeMock } from '../../mocks/user.mock'
import { Strings } from '../../../src/utils/strings'

describe('Validators: Educator', () => {
    const educator: Educator = new EducatorMock()
    educator.password = 'educator_password'

    context('when the validation was successful', () => {
        it('should return undefined', () => {
            const result = CreateEducatorValidator.validate(educator)
            assert.equal(result, undefined)
        })
    })

    context('when the educator was incomplete', () => {
        it('should throw an error for does not pass username', () => {
            educator.username = undefined

            try {
                CreateEducatorValidator.validate(educator)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'username'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass password', () => {
            educator.username = 'educator'
            educator.password = undefined

            try {
                CreateEducatorValidator.validate(educator)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'password'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass type', () => {
            educator.password = 'educator_password'
            educator.type = ''

            try {
                CreateEducatorValidator.validate(educator)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'type'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass institution', () => {
            educator.type = UserTypeMock.EDUCATOR
            educator.institution = undefined

            try {
                CreateEducatorValidator.validate(educator)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'institution'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for pass institution without id', () => {
            educator.institution = new Institution()

            try {
                CreateEducatorValidator.validate(educator)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'institution'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const emptyEducator: Educator = new Educator()
            emptyEducator.type = ''

            try {
                CreateEducatorValidator.validate(emptyEducator)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'username, password, type, institution'
                    .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })
    })
})
