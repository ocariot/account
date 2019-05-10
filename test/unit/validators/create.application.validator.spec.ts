import { assert } from 'chai'
import { CreateApplicationValidator } from '../../../src/application/domain/validator/create.application.validator'
import { Application } from '../../../src/application/domain/model/application'
import { ApplicationMock } from '../../mocks/application.mock'
import { UserTypeMock } from '../../mocks/user.mock'

describe('Validators: Application', () => {
    const app: Application = new ApplicationMock()
    app.password = 'application_password'

    context('when the validation was successful', () => {
        it('should return undefined', () => {
            const result = CreateApplicationValidator.validate(app)
            assert.equal(result, undefined)
        })
    })

    context('when the application was incomplete', () => {
        it('should throw an error for does not pass username', () => {
            app.username = ''

            try {
                CreateApplicationValidator.validate(app)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Application validation: username is required!')
            }
        })

        it('should throw an error for does not pass password', () => {
            app.username = 'application'
            app.password = ''

            try {
                CreateApplicationValidator.validate(app)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Application validation: password is required!')
            }
        })

        it('should throw an error for does not pass type', () => {
            app.password = 'application_password'
            app.type = ''

            try {
                CreateApplicationValidator.validate(app)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Application validation: type is required!')
            }
        })

        it('should throw an error for does not pass application name', () => {
            app.type = UserTypeMock.APPLICATION
            app.application_name = ''

            try {
                CreateApplicationValidator.validate(app)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Application validation: application_name is required!')
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const emptyApp: Application = new Application()
            emptyApp.type = ''

            try {
                CreateApplicationValidator.validate(emptyApp)
            } catch (err) {
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Application validation: username, ' +
                    'password, type, application_name is required!')
            }
        })
    })
})
