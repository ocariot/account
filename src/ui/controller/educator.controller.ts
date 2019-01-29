import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpGet, httpPatch, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { Query } from '../../infrastructure/repository/query/query'
import { ApiException } from '../exception/api.exception'
import { ILogger } from '../../utils/custom.logger'
import { Strings } from '../../utils/strings'
import { IEducatorService } from '../../application/port/educator.service.interface'
import { Educator } from '../../application/domain/model/educator'

/**
 * Controller that implements Educator feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/users/educators')
export class EducatorController {

    /**
     * Creates an instance of Educator controller.
     *
     * @param {IEducatorService} _educatorService
     * @param {ILogger} _logger
     */
    constructor(
        @inject(Identifier.EDUCATOR_SERVICE) private readonly _educatorService: IEducatorService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Add new educator.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/')
    public async saveEducator(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const educator: Educator = new Educator().fromJSON(req.body)
            const result: Educator = await this._educatorService.add(educator)
            return res.status(HttpStatus.CREATED).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get all educators.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/')
    public async getAllEducators(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Array<Educator> = await this._educatorService
                .getAll(new Query().fromJSON(req.query))
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get educator by id.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:educator_id')
    public async getEducatorById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Educator = await this._educatorService
                .getById(req.params.educator_id, new Query().fromJSON(req.query))
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageEducatorNotFound())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Update educator by ID.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPatch('/:educator_id')
    public async updateEducatorById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const educator: Educator = new Educator().fromJSON(req.body)
            educator.id = req.params.educator_id
            const result: Educator = await this._educatorService.update(educator)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageEducatorNotFound())
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
     * @param educator
     */
    private toJSONView(educator: Educator | Array<Educator>): object {
        if (educator instanceof Array) {
            return educator.map(item => {
                item.type = undefined
                return item.toJSON()
            })
        }
        educator.type = undefined
        return educator.toJSON()
    }

    /**
     * Default message when resource is not found or does not exist.
     */
    private getMessageEducatorNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            Strings.EDUCATOR.NOT_FOUND,
            Strings.EDUCATOR.NOT_FOUND_DESCRIPTION
        ).toJson()
    }
}
