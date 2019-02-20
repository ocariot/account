import { expect } from 'chai'
import { CreateApplicationValidator } from '../../../src/application/domain/validator/create.application.validator'
import { Application } from '../../../src/application/domain/model/application'

describe('Validators: Application', () => {
    it('should return undefined when the validation was successful', () => {
        const app: Application = new Application()
        app.username = 'application'
        app.password = 'secretkey'
        app.application_name = 'AnyName'

        const result = CreateApplicationValidator.validate(app)
        expect(result).is.undefined
    })

    context('when the application was incomplete', () => {
        it('should throw an error for does not pass username', () => {
            const app: Application = new Application()
            app.password = 'secretkey'
            app.application_name = 'AnyName'

            try {
                CreateApplicationValidator.validate(app)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Application validation: username is required!')
            }
        })

        it('should throw an error for does not pass password', () => {
            const app: Application = new Application()
            app.username = 'application'
            app.application_name = 'AnyName'

            try {
                CreateApplicationValidator.validate(app)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Application validation: password is required!')
            }
        })

        it('should throw an error for does not pass application name', () => {
            const app: Application = new Application()
            app.username = 'application'
            app.password = 'secretkey'

            try {
                CreateApplicationValidator.validate(app)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Application validation: application_name is required!')
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const app: Application = new Application()

            try {
                CreateApplicationValidator.validate(app)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Application validation: username, ' +
                    'password, application_name is required!')
            }
        })
    })
})
