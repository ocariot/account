import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { IAuthService } from '../../application/port/auth.service.interface'
import { ApiException } from '../exception/api.exception'

/**
 * Controller that implements Auth feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/auth')
export class AuthController {

    /**
     * Creates an instance of Child controller.
     *
     * @param {IAuthService} _authService
     */
    constructor(
        @inject(Identifier.AUTH_SERVICE) private readonly _authService: IAuthService
    ) {
    }

    /**
     * Authenticates user and returns access token.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/')
    public async auth(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: any = await this._authService.authenticate(req.body.username, req.body.password)
            if (result) return res.status(HttpStatus.OK).send(result)
            return res.status(HttpStatus.UNAUTHORIZED)
                .send(new ApiException(HttpStatus.UNAUTHORIZED, 'Invalid username or password!').toJson())
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }
}
