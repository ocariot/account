import { Institution } from '../../../src/application/domain/model/institution'
import { assert } from 'chai'
import { HealthProfessional } from '../../../src/application/domain/model/health.professional'
import { CreateHealthProfessionalValidator } from '../../../src/application/domain/validator/create.health.professional.validator'
import { HealthProfessionalMock } from '../../mocks/health.professional.mock'
import { UserTypeMock } from '../../mocks/user.mock'
import { Strings } from '../../../src/utils/strings'

describe('Validators: HealthProfessional', () => {
    const healthProfessional: HealthProfessional = new HealthProfessionalMock()
    healthProfessional.password = 'health_professional_password'

    context('when the validation was successful', () => {
        it('should return undefined', () => {
            const result = CreateHealthProfessionalValidator.validate(healthProfessional)
            assert.equal(result, undefined)
        })
    })

    context('when the health professional was incomplete', () => {
        it('should throw an error for does not pass username', () => {
            healthProfessional.username = undefined

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'username'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass password', () => {
            healthProfessional.username = 'healthprofessional'
            healthProfessional.password = undefined

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'password'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass type', () => {
            healthProfessional.password = 'health_professional_password'
            healthProfessional.type = ''

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'type'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass institution', () => {
            healthProfessional.type = UserTypeMock.HEALTH_PROFESSIONAL
            healthProfessional.institution = undefined

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'institution'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for pass institution without id', () => {
            healthProfessional.institution = new Institution()

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'institution'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const emptyHealthProfessional: HealthProfessional = new HealthProfessional()
            emptyHealthProfessional.type = ''

            try {
                CreateHealthProfessionalValidator.validate(emptyHealthProfessional)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'username, password, type, institution'
                    .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })
    })
})
