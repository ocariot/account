import { Request, Response } from 'express'
import { Firebase } from '../models/firebase'
import { FirebaseProfileRepository } from '../repositories/firebase.profile.repository'
import { IFirebase } from '../models/firebase'
import { IExceptionError } from './../exceptions/api.exception'

/**
 * Controller that implements User feature operations.
 * 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
export class UserFirebaseProfileController {
    firebaseProfileRepository: FirebaseProfileRepository

    constructor(UserModel: any) {
        this.firebaseProfileRepository = new FirebaseProfileRepository(UserModel)

    }

                   /**
     * Add new user.
     * 
     * @param req Request.
     * @param res Response.
     * @returns any
     */
    addFirebaseProfile(req: Request, res: Response): any {
        req.body.user_id = req.params.user_id
        return this.firebaseProfileRepository.save(new Firebase(req.body))
            .then((user: IFirebase) => res.status(201).send(user))
            .catch((err: IExceptionError) => res.status(err.code).send(err.toJson())) 
    }

                /**
     * Add new user.
     * 
     * @param req Request.
     * @param res Response.
     * @returns any
     */
    getFirebaseProfile(req: Request, res: Response): any {
        return this.firebaseProfileRepository
            .getById(req.params.user_id)
            .then((result: IFirebase[]) => res.send(result))
            .catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))  
    }

                /**
     * Add new user.
     * 
     * @param req Request.
     * @param res Response.
     * @returns any
     */
    removeFirebaseProfile(req: Request, res: Response): any {
        return this.firebaseProfileRepository.delete(req.params.user_id)
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
    getAllFirebaseProfile(req: Request, res: Response): any {
        return this.firebaseProfileRepository.getAll()
            .then((users: Array<IFirebase>) => res.send(users))
            .catch((err: IExceptionError) => res.status(err.code).send(err.toJson())) 
    }
}