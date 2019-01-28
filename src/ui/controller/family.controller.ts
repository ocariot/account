import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpGet, httpPatch, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { Query } from '../../infrastructure/repository/query/query'
import { ApiException } from '../exception/api.exception'
import { ILogger } from '../../utils/custom.logger'
import { Family } from '../../application/domain/model/family'
import { IFamilyService } from '../../application/port/family.service.interface'

/**
 * Controller that implements Family feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/users/families')
export class FamilyController {

    /**
     * Creates an instance of Family controller.
     *
     * @param {IFamilyService} _familyService
     * @param {ILogger} _logger
     */
    constructor(
        @inject(Identifier.FAMILY_SERVICE) private readonly _familyService: IFamilyService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Add new family.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/')
    public async saveFamily(@request() req: Request, @response() res: Response) {
        try {
            const family: Family = new Family().fromJSON(req.body)
            const result: Family = await this._familyService.add(family)
            return res.status(HttpStatus.CREATED).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get all families.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/')
    public async getAllFamilies(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Array<Family> = await this._familyService
                .getAll(new Query().fromJSON(req.query))
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get family by id.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:family_id')
    public async getFamilyById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Family = await this._familyService
                .getById(req.params.family_id, new Query().fromJSON(req.query))
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFoundFamily())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Update family by ID.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPatch('/:family_id')
    public async updateFamilyById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const family: Family = new Family().fromJSON(req.body)
            family.id = req.params.family_id
            const result: Family = await this._familyService.update(family)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFoundFamily())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get all children from family.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/')
    public async getAllChildrenFromFamily(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Array<Family> = await this._familyService
                .getAll(new Query().fromJSON(req.query))
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
     * @param family
     */
    private toJSONView(family: Family | Array<Family>): object {
        if (family instanceof Array) {
            return family.map(item => {
                item.type = undefined
                return item.toJSON()
            })
        }
        family.type = undefined
        return family.toJSON()
    }

    /**
     * Default message when resource is not found or does not exist.
     */
    private getMessageNotFoundFamily(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Family not found!',
            'Family not found or already removed. A new operation for the same resource is not required!'
        ).toJson()
    }
}
