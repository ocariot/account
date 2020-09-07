import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class NfcTagValidator {
    public static validate(tag: string | undefined): void | ValidationException {
        if (!tag) {
            throw new ValidationException(Strings.CHILD.NFC_TAG_NOT_VALID_FORMAT)
        }
    }
}
