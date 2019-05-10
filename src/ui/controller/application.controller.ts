import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpGet, httpPatch, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { Query } from '../../infrastructure/repository/query/query'
import { ApiException } from '../exception/api.exception'
import { ILogger } from '../../utils/custom.logger'
import { IApplicationService } from '../../application/port/application.service.interface'
import { Strings } from '../../utils/strings'
import { Application } from '../../application/domain/model/application'

/**
 * Controller that implements Application feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/users/applications')
export class ApplicationController {

    /**
     * Creates an instance of Application controller.
     *
     * @param {IApplicationService} _application
     * @param {ILogger} _logger
     */
    constructor(
        @inject(Identifier.APPLICATION_SERVICE) private readonly _application: IApplicationService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Add new application.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/')
    public async saveApplication(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const application: Application = new Application().fromJSON(req.body)
            const result: Application = await this._application.add(application)
            return res.status(HttpStatus.CREATED).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get all applications.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/')
    public async getAllApplications(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Array<Application> = await this._application
                .getAll(new Query().fromJSON(req.query))
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get application by ID.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:application_id')
    public async getApplicationById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Application = await this._application
                .getById(req.params.application_id, new Query().fromJSON(req.query))
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFoundApplication())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Update application by ID.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPatch('/:application_id')
    public async updateApplicationById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const application: Application = new Application().fromJSON(req.body)
            application.id = req.params.application_id
            const result: Application = await this._application.update(application)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFoundApplication())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Convert object to json format expected by view.
     *
     * @param application
     */
    private toJSONView(application: Application | Array<Application>): object {
        if (application instanceof Array) {
            return application.map(item => {
                item.type = undefined
                return item.toJSON()
            })
        }
        application.type = undefined
        return application.toJSON()
    }

    /**
     * Default message when resource is not found or does not exist.
     */
    private getMessageNotFoundApplication(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            Strings.APPLICATION.NOT_FOUND,
            Strings.APPLICATION.NOT_FOUND_DESCRIPTION
        ).toJson()
    }
}
