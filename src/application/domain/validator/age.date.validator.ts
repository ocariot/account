import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class AgeDateValidator {
    public static validate(datetime: string, message?: string, description?: string): void | ValidationException {
        // validate datetime
        if (!(/^\d{4}-(0[1-9]|1[0-2])-\d\d$/i).test(datetime)) {
            throw new ValidationException(message ? message : `Datetime: ${datetime}`.concat(Strings.ERROR_MESSAGE.INVALID_DATE),
                description ? description : 'Date must be in the format: yyyy-MM-dd')
        }
        // Validate day
        const date: Date = new Date(datetime)
        if (isNaN(date.getTime())) {
            throw new ValidationException(message ? message : `Datetime: ${datetime}`.concat(Strings.ERROR_MESSAGE.INVALID_DATE),
                description ? description : 'Date must be in the format: yyyy-MM-dd')
        }

        if (date.getTime() > new Date().getTime())
            throw new ValidationException(`Datetime: ${datetime}, cannot be used!`,
                'The \'age\' and \'age_calc_date\' fields can only receive past or present dates.')
    }
}
