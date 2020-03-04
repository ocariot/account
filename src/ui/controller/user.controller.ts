import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpPost, httpPut, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { ApiException } from '../exception/api.exception'
import { IUserService } from '../../application/port/user.service.interface'
import { Strings } from '../../utils/strings'

/**
 * Controller that implements User feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/users')
export class UserController {

    /**
     * Creates an instance of User controller.
     *
     * @param {IUserService} _userService
     */
    constructor(
        @inject(Identifier.USER_SERVICE) private readonly _userService: IUserService
    ) {
    }

    /**
     * Change user password.
     *
     * @param req
     * @param res
     */
    @httpPut('/:user_id/password')
    public async changeUserPassword(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: boolean = await this._userService
                .changePassword(req.params.user_id, req.body.old_password, req.body.new_password)
            if (!result) {
                return res.status(HttpStatus.NOT_FOUND).send(this.getMessageUserNotFound())
            }
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Reset user password.
     *
     * @param req
     * @param res
     */
    @httpPost('/:user_id/reset-password')
    public async resetUserPassword(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: boolean = await this._userService.resetPassword(req.params.user_id, req.body.new_password)
            if (!result) {
                return res.status(HttpStatus.NOT_FOUND).send(this.getMessageUserNotFound())
            }
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Replaces the scopes of all users according to the type.
     *
     * @param req
     * @param res
     */
    @httpPost('/types/:user_type/scopes')
    public async replaceUsersScopesFromType(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._userService.replaceScopes(req.params.user_type, req.body.scopes)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Remove user by id.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpDelete('/:user_id')
    public async removeUser(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._userService.remove(req.params.user_id)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Default message when resource is not found or does not exist.
     */
    private getMessageUserNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            Strings.USER.NOT_FOUND,
            Strings.USER.NOT_FOUND_DESCRIPTION
        ).toJson()
    }
}
