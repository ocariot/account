import { Institution } from '../../../src/application/domain/model/institution'
import { assert } from 'chai'
import { Family } from '../../../src/application/domain/model/family'
import { CreateFamilyValidator } from '../../../src/application/domain/validator/create.family.validator'
import { Child } from '../../../src/application/domain/model/child'
import { FamilyMock } from '../../mocks/family.mock'
import { UserTypeMock } from '../../mocks/user.mock'
import { InstitutionMock } from '../../mocks/institution.mock'
import { Strings } from '../../../src/utils/strings'

describe('Validators: Family', () => {
    const family: Family = new FamilyMock()
    family.password = 'family_password'

    context('when the validation was successful', () => {
        it('should return undefined', () => {
            const result = CreateFamilyValidator.validate(family)
            assert.equal(result, undefined)
        })
    })

    context('when the educator was incomplete', () => {
        it('should throw an error for does not pass username', () => {
            family.username = undefined

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'username'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass password', () => {
            family.username = 'family'
            family.password = undefined

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'password'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass type', () => {
            family.password = 'family_password'
            family.type = ''

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'type'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass institution', () => {
            family.type = UserTypeMock.FAMILY
            family.institution = undefined

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'institution'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for pass institution without id', () => {
            family.institution = new Institution()

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'institution'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for does not pass children collection', () => {
            family.institution = new InstitutionMock()
            family.children = undefined

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'Collection with children IDs'
                    .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should throw an error for pass children collection with child without id', () => {
            family.children = [new Child()]

            try {
                CreateFamilyValidator.validate(family)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'Collection with children IDs (ID can not be empty)'
                    .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })

        it('should trow an error for does not pass any of required parameters', () => {
            const emptyFamily: Family = new Family()
            emptyFamily.type = ''

            try {
                CreateFamilyValidator.validate(emptyFamily)
            } catch (err) {
                assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                assert.equal(err.description, 'username, password, type, institution, ' +
                    'Collection with children IDs'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
            }
        })
    })
})
