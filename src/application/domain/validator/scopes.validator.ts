import { ValidationException } from '../exception/validation.exception'
import { UserType } from '../model/user'
import { Default } from '../../../utils/default'
import { Strings } from '../../../utils/strings'

export class ScopesValidator {
    public static validate(userType: string, scopes: Array<string>): void | ValidationException {
        const invalidScopes: Array<string> = []

        // Array of scopes without elements
        if (scopes === undefined || !scopes.length) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_1)
        }

        // Array of scopes with one or more scopes that cannot belong to such users
        switch (userType) {
            case UserType.ADMIN:
                for (const scopeItem of scopes) {
                    if (!Default.ADMIN_SCOPES.includes(scopeItem)) invalidScopes.push(scopeItem)
                }

                if (invalidScopes.length) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                        Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_2.replace('{0}', invalidScopes.join(', '))
                            .replace('{1}', userType))
                }

                break

            case UserType.APPLICATION:
                for (const scopeItem of scopes) {
                    if (!Default.APPLICATION_SCOPES.includes(scopeItem)) invalidScopes.push(scopeItem)
                }

                if (invalidScopes.length) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                        Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_2.replace('{0}', invalidScopes.join(', '))
                            .replace('{1}', userType))
                }

                break

            case UserType.CHILD:
                for (const scopeItem of scopes) {
                    if (!Default.CHILD_SCOPES.includes(scopeItem)) invalidScopes.push(scopeItem)
                }

                if (invalidScopes.length) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                        Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_2.replace('{0}', invalidScopes.join(', '))
                            .replace('{1}', userType))
                }

                break

            case UserType.EDUCATOR:
                for (const scopeItem of scopes) {
                    if (!Default.EDUCATOR_SCOPES.includes(scopeItem)) invalidScopes.push(scopeItem)
                }

                if (invalidScopes.length) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                        Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_2.replace('{0}', invalidScopes.join(', '))
                            .replace('{1}', userType))
                }

                break

            case UserType.FAMILY:
                for (const scopeItem of scopes) {
                    if (!Default.FAMILY_SCOPES.includes(scopeItem)) invalidScopes.push(scopeItem)
                }

                if (invalidScopes.length) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                        Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_2.replace('{0}', invalidScopes.join(', '))
                            .replace('{1}', userType))
                }

                break

            case UserType.HEALTH_PROFESSIONAL:
                for (const scopeItem of scopes) {
                    if (!Default.HEALTH_PROF_SCOPES.includes(scopeItem)) invalidScopes.push(scopeItem)
                }

                if (invalidScopes.length) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_SCOPES,
                        Strings.ERROR_MESSAGE.INVALID_SCOPES_DESC_2.replace('{0}', invalidScopes.join(', '))
                            .replace('{1}', userType))
                }

                break
        }
    }
}
