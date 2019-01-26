import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpGet, httpPatch, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { Query } from '../../infrastructure/repository/query/query'
import { ApiException } from '../exception/api.exception'
import { ILogger } from '../../utils/custom.logger'
import { IChildService } from '../../application/port/child.service.interface'
import { Child } from '../../application/domain/model/child'

/**
 * Controller that implements Child feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/users/children')
export class ChildController {

    /**
     * Creates an instance of Child controller.
     *
     * @param {IChildService} _childService
     * @param {ILogger} _logger
     */
    constructor(
        @inject(Identifier.CHILD_SERVICE) private readonly _childService: IChildService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Add new child.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/')
    public async saveChild(@request() req: Request, @response() res: Response) {
        try {
            const child: Child = new Child().deserialize(req.body)
            const result: Child = await this._childService.add(child)
            return res.status(HttpStatus.CREATED).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get all children.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/')
    public async getAllChildren(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            console.log(`entrou`)
            const result: Array<Child> = await this._childService
                .getAll(new Query().deserialize(req.query))
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get child by id.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:child_id')
    public async getChildById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Child = await this._childService
                .getById(req.params.child_id, new Query().deserialize(req.query))
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFoundChild())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Update child by user.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPatch('/:child_id')
    public async updateChildById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const child: Child = new Child().deserialize(req.body)
            child.id = req.params.child_id
            const result: Child = await this._childService.update(child)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFoundChild())
            return res.status(HttpStatus.OK).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Default message when resource is not found or does not exist.
     */
    private getMessageNotFoundChild(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Child not found!',
            'Child not found or already removed. A new operation for the same resource is not required!'
        ).toJson()
    }
}
