import { Request, Response } from 'express'
import { Fitbit } from '../models/fitbit'
import { FitibitProfileRepository } from '../repositories/fitbit.profile.repository'
import { IFitbit } from '../models/fitbit'
import { IExceptionError } from './../exceptions/api.exception'

/**
 * Controller that implements User feature operations.
 * 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
export class UserFitibitProfileController {
    fitibitProfileRepository: FitibitProfileRepository

    constructor(FitbitProfileModel: any) {
        this.fitibitProfileRepository = new FitibitProfileRepository(FitbitProfileModel)
    }

            /**
     * Add new user.
     * 
     * @param req Request.
     * @param res Response.
     * @returns any
     */
    addFitbitProfile(req: Request, res: Response): any {
        req.body.user_id = req.params.user_id
        return this.fitibitProfileRepository.save(new Fitbit(req.body))
            .then((profile: IFitbit) => res.status(201).send(profile))
            .catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))   
    }

            /**
     * Add new user.
     * 
     * @param req Request.
     * @param res Response.
     * @returns any
     */
    getFitbitProfile(req: Request, res: Response): any {
        return this.fitibitProfileRepository 
            .getById(req.params.user_id)
            .then((result: IFitbit[]) => res.send(result))
            .catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))    
    }

            /**
     * Add new user.
     * 
     * @param req Request.
     * @param res Response.
     * @returns any
     */
    removeFitbitProfile(req: Request, res: Response): any {
        return this.fitibitProfileRepository.delete(req.params.user_id)
            .then((result: boolean) => res.status(201).send(result))
            .catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))  
    }

            /**
     * Add new user.
     * 
     * @param req Request.
     * @param res Response.
     * @returns any
     */
    getAllFitbitProfile(req: Request, res: Response): any {
        return this.fitibitProfileRepository.getAll()
            .then((users: Array<IFitbit>) => res.send(users))
            .catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))  
    }
}