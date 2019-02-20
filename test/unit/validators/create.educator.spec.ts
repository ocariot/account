import { Institution } from '../../../src/application/domain/model/institution'
import { assert } from 'chai'
import { ObjectID } from 'bson'
import { CreateEducatorValidator } from '../../../src/application/domain/validator/create.educator.validator'
import { Educator } from '../../../src/application/domain/model/educator'

describe('Validators: Educator', () => {
    const institution = new Institution()
    institution.id = `${new ObjectID()}`

    it('should return undefined when the validation was successful', () => {
        const educator: Educator = new Educator()
        educator.username = 'educator'
        educator.password = 'mysecretkey'
        educator.children_groups = []
        educator.institution = institution

        const result = CreateEducatorValidator.validate(educator)
        assert.equal(result, undefined)
    })

    context('when the educator was incomplete', () => {
        it('should throw an error for does not pass username', () => {
            const educator: Educator = new Educator()
            educator.password = 'mysecretkey'
            educator.children_groups = []
            educator.institution = institution

            try {
                CreateEducatorValidator.validate(educator)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Educator validation: username is required!')
            }
        })

        it('should throw an error for does not pass password', () => {
            const educator: Educator = new Educator()
            educator.username = 'educator'
            educator.children_groups = []
            educator.institution = institution

            try {
                CreateEducatorValidator.validate(educator)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Educator validation: password is required!')
            }
        })

        it('should throw an error for does not pass type', () => {
            const educator: Educator = new Educator()
            educator.username = 'educator'
            educator.password = 'mysecretkey'
            educator.children_groups = []
            educator.institution = institution
            educator.type = undefined

            try {
                CreateEducatorValidator.validate(educator)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Educator validation: type is required!')
            }
        })

        it('should throw an error for does not pass institution', () => {
            const educator: Educator = new Educator()
            educator.username = 'educator'
            educator.password = 'mysecretkey'
            educator.children_groups = []

            try {
                CreateEducatorValidator.validate(educator)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Educator validation: institution is required!')
            }
        })

        it('should throw an error for pass institution without id', () => {
            const educator: Educator = new Educator()
            educator.username = 'educator'
            educator.password = 'mysecretkey'
            educator.children_groups = []
            educator.institution = new Institution()

            try {
                CreateEducatorValidator.validate(educator)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Educator validation: institution is required!')
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const educator: Educator = new Educator()

            try {
                CreateEducatorValidator.validate(educator)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Required fields were not provided...')
                assert.equal(err.description, 'Educator validation: username, ' +
                    'password, institution is required!')
            }
        })
    })
})
