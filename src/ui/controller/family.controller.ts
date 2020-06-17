import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, httpPatch, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { Query } from '../../infrastructure/repository/query/query'
import { ApiException } from '../exception/api.exception'
import { ILogger } from '../../utils/custom.logger'
import { Family } from '../../application/domain/model/family'
import { IFamilyService } from '../../application/port/family.service.interface'
import { Strings } from '../../utils/strings'
import { Child } from '../../application/domain/model/child'
import { IQuery } from '../../application/port/query.interface'
import { UserType } from '../../application/domain/model/user'

/**
 * Controller that implements Family feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/families')
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
    public async saveFamily(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const family: Family = new Family().fromJSON(req.body)
            family.id = undefined
            const result: Family = await this._familyService.add(family)
            return res.status(HttpStatus.CREATED).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
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
            const count: number = await this._familyService.count()
            res.setHeader('X-Total-Count', count)
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
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
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ _id: req.params.family_id, type: UserType.FAMILY })
            const result: Family = await this._familyService
                .getById(req.params.family_id, query)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageFamilyNotFound())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
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
            // Ignore last_login attributes if exists.
            family.last_login = undefined
            const result: Family | undefined = await this._familyService.update(family)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageFamilyNotFound())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
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
    @httpGet('/:family_id/children')
    public async getAllChildrenFromFamily(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const query: IQuery = new Query().fromJSON(req.query)
            query.addFilter({ _id: req.params.family_id, type: UserType.FAMILY })
            const result: Array<Child> | undefined = await this._familyService
                .getAllChildren(req.params.family_id, query)
            const count: number = await this._familyService.countChildrenFromFamily(req.params.family_id)
            res.setHeader('X-Total-Count', count)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageFamilyNotFound())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Associate a child with a family.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/:family_id/children/:child_id')
    public async associateChildToFamily(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Family | undefined = await this._familyService
                .associateChild(req.params.family_id, req.params.child_id)

            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageFamilyNotFound())
            return res.status(HttpStatus.OK).send(this.toJSONView(result))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Disassociate a child from a family.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpDelete('/:family_id/children/:child_id')
    public async disassociateChildFromFamily(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: boolean | undefined = await this._familyService
                .disassociateChild(req.params.family_id, req.params.child_id)

            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageFamilyNotFound())
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Convert object to json format expected by view.
     *
     * @param user
     */
    private toJSONView(user: Family | Child | Array<Family | Child>): object {
        if (user instanceof Array) {
            return user.map(item => {
                item.type = undefined
                return item.toJSON()
            })
        }
        user.type = undefined
        return user.toJSON()
    }

    /**
     * Default message when resource is not found or does not exist.
     */
    private getMessageFamilyNotFound(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            Strings.FAMILY.NOT_FOUND,
            Strings.FAMILY.NOT_FOUND_DESCRIPTION
        ).toJSON()
    }
}
