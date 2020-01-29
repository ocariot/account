import { ValidationException } from '../exception/validation.exception'
import { DateValidator } from './date.validator'
import { Strings } from '../../../utils/strings'

export class AgeDateValidator {
    public static validate(datetime: string): void | ValidationException {
        // validate date
        DateValidator.validate(datetime)

        const date: Date = new Date(datetime)
        if (date.getTime() > new Date().getTime())
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_AGE_DATE.replace('{0}', datetime),
                Strings.ERROR_MESSAGE.INVALID_AGE_DATE_DESC)
    }
}
