
/**
 * Class BaseException
 * 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
export class ApiException extends Error implements IExceptionError {
    code: number
    description?: string

    constructor(code: number, message: string, description?: string) {
        super(message)
        this.code = code
        this.description = description

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, new.target.prototype);
    }

    /**
     * Mounts default error message according to parameters.
     * 
     * @param code Error code.
     * @param message Short error message.
     * @param description Error description.
     * @returns Object
     */
    toJson(): Object {
        return {
            'code': this.code,
            'message': this.message,
            'description': this.description
        }
    }
}

/**
 * Interface ErrorRequest
 * 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
export interface IExceptionError {
    code: number
    message: string
    description?: string
    toJson(): Object
}