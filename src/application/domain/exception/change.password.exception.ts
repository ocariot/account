import { Exception } from './exception'

/**
 * Change Password Exception
 *
 * @extends {Exception}
 */
export class ChangePasswordException extends Exception {
    /**
     * Creates an instance of ChangePasswordException.
     *
     * @param message Short message
     * @param description Detailed message
     */
    constructor(message: string, description?: string) {
        super(message, description)
    }
}
