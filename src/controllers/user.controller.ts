import { Request, Response } from 'express'
import { User } from '../models/user'
import { UserRepository } from '../repositories/user.repository'
import { IUser } from '../models/user'
import { IExceptionError } from './../exceptions/api.exception'

/**
 * Controller that implements User feature operations.
 * 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
export class UserController {
    repository: UserRepository

    constructor(UserModel: any) {
        this.repository = new UserRepository(UserModel)
    }

    /**
     * Add new user.
     * 
     * @param req Request.
     * @param res Response.
     * @returns any
     */
    addUser(req: Request, res: Response): any {
        return this.repository.save(new User(req.body))
            .then((user: IUser) => res.status(201).send(user))
            .catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))
    }

    /**
     * Get all users.
     * 
     * @param req Request.
     * @param res Response.
     * @returns any
     */
    getAllUsers(req: Request, res: Response): any {
        return this.repository.getAll()
            .then((users: Array<IUser>) => res.send(users))
            .catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))
    }

    /**
     * Get user by id.
     * 
     * @param req Request.
     * @param res Response.
     * @returns any
     */
    getUserById(req: Request, res: Response): any {
        return this.repository
            .getById(req.params.user_id)
            .then((result: IUser) => res.send(result))
            .catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))
    }

}