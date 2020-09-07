import { assert } from 'chai'
import { NfcTagValidator } from '../../../src/application/domain/validator/nfc.tag.validator'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Strings } from '../../../src/utils/strings'

describe('Validators: CreateNfcTagValidator', () => {
    context('Successful validation', () => {
        it('should return undefined representing the success of the validation', () => {
            try {
                NfcTagValidator.validate('04a22422dd6480')
                NfcTagValidator.validate('f719c76b')
            } catch (err) {
                assert.fail()
            }
        })
    })

    context('Unsuccessful validation', () => {
        it('should return throw ValidationException when tag is "" | undefined', () => {
            try {
                NfcTagValidator.validate(undefined)
                NfcTagValidator.validate('')
            } catch (err) {
                assert.instanceOf(err, ValidationException)
            }
        })

        it('should return nfc tag message in valid format is required', () => {
            try {
                NfcTagValidator.validate(undefined)
                NfcTagValidator.validate('')
            } catch (err) {
                assert.equal(err.message, Strings.CHILD.NFC_TAG_NOT_VALID_FORMAT)
            }
        })
    })
})
