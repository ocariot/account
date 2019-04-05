import { Institution } from '../../../src/application/domain/model/institution'
import { assert } from 'chai'
import { HealthProfessional } from '../../../src/application/domain/model/health.professional'
import { CreateHealthProfessionalValidator } from '../../../src/application/domain/validator/create.health.professional.validator'
import { HealthProfessionalMock } from '../../mocks/health.professional.mock'
import { UserTypeMock } from '../../mocks/user.mock'

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
            healthProfessional.username = ''

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Health Professional validation: username is required!')
            }
        })

        it('should throw an error for does not pass password', () => {
            healthProfessional.username = 'healthprofessional'
            healthProfessional.password = ''

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Health Professional validation: password is required!')
            }
        })

        it('should throw an error for does not pass type', () => {
            healthProfessional.password = 'health_professional_password'
            healthProfessional.type = ''

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Health Professional validation: type is required!')
            }
        })

        it('should throw an error for does not pass institution', () => {
            healthProfessional.type = UserTypeMock.HEALTH_PROFESSIONAL
            healthProfessional.institution = undefined

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Health Professional validation: institution is required!')
            }
        })

        it('should throw an error for pass institution without id', () => {
            healthProfessional.institution = new Institution()

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Health Professional validation: institution is required!')
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const emptyHealthProfessional: HealthProfessional = new HealthProfessional()
            emptyHealthProfessional.type = ''

            try {
                CreateHealthProfessionalValidator.validate(emptyHealthProfessional)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Health Professional validation: username, ' +
                    'password, type, institution is required!')
            }
        })
    })
})
