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
import { Strings } from '../../utils/strings'
import { IQuery } from '../../application/port/query.interface'
import { UserType } from '../../application/domain/model/user'

/**
 * Controller that implements Child feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/children')
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
    public async saveChild(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const child: Child = new Child().fromJSON(req.body)
            child.id = undefined
            const result: Child = await this._childService.add(child)
            return res.status(HttpStatus.CREATED).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
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
            const result: Array<Child> = await this._childService
                .getAll(new Query().fromJSON(req.query))
            const count: number = await this._childService.count()
            res.setHeader('X-Total-Count', count)
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        } finally {
            req.query = {}
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
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ _id: req.params.child_id, type: UserType.CHILD })
            const result: Child = await this._childService
                .getById(req.params.child_id, query)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageChildNotFound())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Update child by ID.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPatch('/:child_id')
    public async updateChildById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const child: Child = new Child().fromJSON(req.body)
            child.id = req.params.child_id
            // Ignore last_login and last_sync.
            child.last_login = undefined
            child.last_sync = undefined
            const result: Child | undefined = await this._childService.update(child)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageChildNotFound())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Convert object to json format expected by view.
     *
     * @param child
     */
    private toJSONView(child: Child | Array<Child>): object {
        if (child instanceof Array) {
            return child.map(item => {
                item.type = undefined
                return item.toJSON()
            })
        }
        child.type = undefined
        return child.toJSON()
    }

    /**
     * Default message when resource is not found or does not exist.
     */
    private getMessageChildNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            Strings.CHILD.NOT_FOUND,
            Strings.CHILD.NOT_FOUND_DESCRIPTION
        ).toJSON()
    }
}
