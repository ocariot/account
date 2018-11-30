import { ApiException } from "../exceptions/api.exception";

export class ValidateAuthentication {

    public static validate(user_name, password): any {
        const fields: Array<String> = []

        if (!user_name) fields.push('user_name')
        if (!password) fields.push('password')

        if (fields.length > 0) {
            return {
                code: 400,
                message: "Required fields not provided",
                description: 'Authentication failed: '.concat(fields.join(', ')).concat(' required!')
            }
        }
    }

}