import { ValidationException } from '../exception/validation.exception'
import { UserType } from '../model/user'
import { Default } from '../../../utils/default'
import { Strings } from '../../../utils/strings'

export class ScopesValidator {
    public static validate(userType: string, scopes: Array<string>): void | ValidationException {
        if (scopes === undefined || !scopes.length) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_2)
        }
        if (userType === UserType.ADMIN) {
            for (const scopeItem of scopes) {
                if (!Default.ADMIN_SCOPES.includes(scopeItem)) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                        Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_1.replace('{0}', scopeItem)
                            .replace('{1}', userType))
                }
            }
        } else if (userType === UserType.APPLICATION) {
            for (const scopeItem of scopes) {
                if (!Default.APPLICATION_SCOPES.includes(scopeItem)) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                        Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_1.replace('{0}', scopeItem)
                            .replace('{1}', userType))
                }
            }
        } else if (userType === UserType.CHILD) {
            for (const scopeItem of scopes) {
                if (!Default.CHILD_SCOPES.includes(scopeItem)) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                        Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_1.replace('{0}', scopeItem)
                            .replace('{1}', userType))
                }
            }
        } else if (userType === UserType.EDUCATOR) {
            for (const scopeItem of scopes) {
                if (!Default.EDUCATOR_SCOPES.includes(scopeItem)) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                        Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_1.replace('{0}', scopeItem)
                            .replace('{1}', userType))
                }
            }
        } else if (userType === UserType.FAMILY) {
            for (const scopeItem of scopes) {
                if (!Default.FAMILY_SCOPES.includes(scopeItem)) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                        Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_1.replace('{0}', scopeItem)
                            .replace('{1}', userType))
                }
            }
        } else if (userType === UserType.HEALTH_PROFESSIONAL) {
            for (const scopeItem of scopes) {
                if (!Default.HEALTH_PROF_SCOPES.includes(scopeItem)) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                        Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_1.replace('{0}', scopeItem)
                            .replace('{1}', userType))
                }
            }
        }
    }
}
