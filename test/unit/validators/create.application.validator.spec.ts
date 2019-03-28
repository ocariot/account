import { assert } from 'chai'
import { CreateApplicationValidator } from '../../../src/application/domain/validator/create.application.validator'
import { Application } from '../../../src/application/domain/model/application'

describe('Validators: Application', () => {
    it('should return undefined when the validation was successful', () => {
        const app: Application = new Application()
        app.username = 'application'
        app.password = 'secretkey'
        app.application_name = 'AnyName'

        const result = CreateApplicationValidator.validate(app)
        assert.equal(result, undefined)
    })

    context('when the application was incomplete', () => {
        it('should throw an error for does not pass username', () => {
            const app: Application = new Application()
            app.password = 'secretkey'
            app.application_name = 'AnyName'

            try {
                CreateApplicationValidator.validate(app)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Application validation: username is required!')
            }
        })

        it('should throw an error for does not pass password', () => {
            const app: Application = new Application()
            app.username = 'application'
            app.application_name = 'AnyName'

            try {
                CreateApplicationValidator.validate(app)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Application validation: password is required!')
            }
        })

        it('should throw an error for does not pass type', () => {
            const app: Application = new Application()
            app.username = 'application'
            app.password = 'secretkey'
            app.application_name = 'AnyName'
            app.type = undefined

            try {
                CreateApplicationValidator.validate(app)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Application validation: type is required!')
            }
        })

        it('should throw an error for does not pass application name', () => {
            const app: Application = new Application()
            app.username = 'application'
            app.password = 'secretkey'

            try {
                CreateApplicationValidator.validate(app)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Application validation: application_name is required!')
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const app: Application = new Application()

            try {
                CreateApplicationValidator.validate(app)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Application validation: username, ' +
                    'password, application_name is required!')
            }
        })
    })
})
