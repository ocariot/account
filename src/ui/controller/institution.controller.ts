import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, httpPatch, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { Query } from '../../infrastructure/repository/query/query'
import { ApiException } from '../exception/api.exception'
import { ILogger } from '../../utils/custom.logger'
import { IInstitutionService } from '../../application/port/institution.service.interface'
import { Institution } from '../../application/domain/model/institution'

/**
 * Controller that implements Institution feature operations.
 *
 * @remarks To define paths, we use library inversify-express-utils.
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/institutions')
export class InstitutionController {

    /**
     * Creates an instance of Institution controller.
     *
     * @param {IInstitutionService} _institutionService
     * @param {ILogger} _logger
     */
    constructor(
        @inject(Identifier.INSTITUTION_SERVICE) private readonly _institutionService: IInstitutionService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Add new Institution.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPost('/')
    public async saveInstitution(@request() req: Request, @response() res: Response) {
        try {
            const institution: Institution = new Institution().fromJSON(req.body)
            const result: Institution = await this._institutionService.add(institution)
            return res.status(HttpStatus.CREATED).send(result.toJSON())
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get all institutions.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/')
    public async getAllInstitutions(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Array<Institution> = await this._institutionService
                .getAll(new Query().fromJSON(req.query))
            return res.status(HttpStatus.OK).send(result.map(item => item.toJSON()))
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Get institution by id.
     * For the query strings, the query-strings-parser middleware was used.
     * @see {@link https://www.npmjs.com/package/query-strings-parser} for further information.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:institution_id')
    public async getInstitutionById(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: Institution = await this._institutionService
                .getById(req.params.institution_id, new Query().fromJSON(req.query))
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFoundInstitution())
            return res.status(HttpStatus.OK).send(result.toJSON())
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Update institution by ID.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpPatch('/:institution_id')
    public async updateInstitution(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const institution: Institution = new Institution().fromJSON(req.body)
            institution.id = req.params.institution_id
            const result: Institution = await this._institutionService.update(institution)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFoundInstitution())
            return res.status(HttpStatus.OK).send(result.toJSON())
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Remove Institution by ID.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpDelete('/:institution_id')
    public async deleteInstitution(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: boolean = await this._institutionService.remove(req.params.institution_id)
            if (!result) return res.status(HttpStatus.NOT_FOUND).send(this.getMessageNotFoundInstitution())
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
    private getMessageNotFoundInstitution(): object {
        return new ApiException(
            HttpStatus.NOT_FOUND,
            'Institution not found!',
            'Institution not found or already removed. A new operation for the same resource is not required!'
        ).toJson()
    }
}
