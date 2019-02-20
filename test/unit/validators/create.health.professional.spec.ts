import { Institution } from '../../../src/application/domain/model/institution'
import { expect } from 'chai'
import { ObjectID } from 'bson'
import { HealthProfessional } from '../../../src/application/domain/model/health.professional'
import { CreateHealthProfessionalValidator } from '../../../src/application/domain/validator/create.health.professional.validator'

describe('Validators: HealthProfessional', () => {
    const institution = new Institution()
    institution.id = `${new ObjectID()}`

    it('should return undefined when the validation was successful', () => {
        const healthProfessional: HealthProfessional = new HealthProfessional()
        healthProfessional.username = 'healthProfessional'
        healthProfessional.password = 'mysecretkey'
        healthProfessional.children_groups = []
        healthProfessional.institution = institution

        const result = CreateHealthProfessionalValidator.validate(healthProfessional)
        expect(result).is.undefined
    })

    context('when the health professional was incomplete', () => {
        it('should throw an error for does not pass username', () => {
            const healthProfessional: HealthProfessional = new HealthProfessional()
            healthProfessional.password = 'mysecretkey'
            healthProfessional.children_groups = []
            healthProfessional.institution = institution

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Health Professional validation: username is required!')
            }
        })

        it('should throw an error for does not pass password', () => {
            const healthProfessional: HealthProfessional = new HealthProfessional()
            healthProfessional.username = 'healthprofessional'
            healthProfessional.children_groups = []
            healthProfessional.institution = institution

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Health Professional validation: password is required!')
            }
        })

        it('should throw an error for does not pass institution', () => {
            const healthProfessional: HealthProfessional = new HealthProfessional()
            healthProfessional.username = 'healthprofessional'
            healthProfessional.password = 'mysecretkey'
            healthProfessional.children_groups = []

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Health Professional validation: institution is required!')
            }
        })

        it('should throw an error for pass institution without id', () => {
            const healthProfessional: HealthProfessional = new HealthProfessional()
            healthProfessional.username = 'healthprofessional'
            healthProfessional.password = 'mysecretkey'
            healthProfessional.children_groups = []
            healthProfessional.institution = new Institution()

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Health Professional validation: institution is required!')
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const healthProfessional: HealthProfessional = new HealthProfessional()

            try {
                CreateHealthProfessionalValidator.validate(healthProfessional)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Health Professional validation: username, ' +
                    'password, institution is required!')
            }
        })
    })
})
