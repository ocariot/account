import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, httpPatch, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { ApiException } from '../exception/api.exception'
import { IUserService } from '../../application/port/user.service.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { ChangePasswordException } from '../../application/domain/exception/change.password.exception'
import { Strings } from '../../utils/strings'
import { IQuery } from '../../application/port/query.interface'
import { IChildService } from '../../application/port/child.service.interface'
import { IFamilyService } from '../../application/port/family.service.interface'
import { IEducatorService } from '../../application/port/educator.service.interface'
import { IHealthProfessionalService } from '../../application/port/health.professional.service.interface'
import { IApplicationService } from '../../application/port/application.service.interface'

/**
 * Controller that implements User feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/users')
export class UserController {

    /**
     * Creates an instance of User controller.
     *
     * @param {IUserService} _userService
     * @param {IChildService} _childService
     * @param {IFamilyService} _familyService
     * @param {IEducatorService} _educatorService
     * @param {IHealthProfessionalService} _healthProfessionalService
     * @param {IApplicationService} _applicationService
     */
    constructor(
        @inject(Identifier.USER_SERVICE) private readonly _userService: IUserService,
        @inject(Identifier.CHILD_SERVICE) private readonly _childService: IChildService,
        @inject(Identifier.FAMILY_SERVICE) private readonly _familyService: IFamilyService,
        @inject(Identifier.EDUCATOR_SERVICE) private readonly _educatorService: IEducatorService,
        @inject(Identifier.HEALTH_PROFESSIONAL_SERVICE) private readonly _healthProfessionalService: IHealthProfessionalService,
        @inject(Identifier.APPLICATION_SERVICE) private readonly _applicationService: IApplicationService
    ) {
    }

    /**
     * Get all users.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/')
    public async getAllUsers(@request() req: Request, @response() res: Response) {
        try {
            const query: IQuery = new Query().fromJSON(req.query)

            const children: Array<any> = await this._childService.getAll(query)
            const families: Array<any> = await this._familyService.getAll(query)
            const educators: Array<any> = await this._educatorService.getAll(query)
            const healthProfessionals: Array<any> = await this._healthProfessionalService.getAll(query)
            const applications: Array<any> = await this._applicationService.getAll(query)

            return res.status(HttpStatus.OK).send(children.concat(families, educators, healthProfessionals, applications))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Change user password.
     *
     * @param req
     * @param res
     */
    @httpPatch('/:user_id/password')
    public async changeUserPassword(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: boolean = await this._userService
                .changePassword(req.params.user_id, req.body.old_password, req.body.new_password)
            if (!result) {
                return res.status(HttpStatus.NOT_FOUND).send(this.getMessageUserNotFound())
            }
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            if (err instanceof ChangePasswordException) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .send(new ApiException(HttpStatus.BAD_REQUEST, err.message, err.description).toJson())
            }
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
