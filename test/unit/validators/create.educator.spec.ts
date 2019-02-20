import { Institution } from '../../../src/application/domain/model/institution'
import { expect } from 'chai'
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
        expect(result).is.undefined
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
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Educator validation: username is required!')
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
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Educator validation: password is required!')
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
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Educator validation: type is required!')
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
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Educator validation: institution is required!')
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
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Educator validation: institution is required!')
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const educator: Educator = new Educator()

            try {
                CreateEducatorValidator.validate(educator)
            } catch (err) {
                expect(err).to.have.property('message')
                expect(err).to.have.property('description')
                expect(err.message).to.eql('Required fields were not provided...')
                expect(err.description).to.eql('Educator validation: username, ' +
                    'password, institution is required!')
            }
        })
    })
})
