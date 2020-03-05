import { UserType } from '../model/user'
import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class UserTypeValidator {
    public static validate(userType: string): void | ValidationException {
        const userTypes: Array<string> = Object.values(UserType)

        if (!userTypes.includes(userType)) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                `The user types allowed are: ${userTypes.join(', ')}.`)
        }
    }
}
