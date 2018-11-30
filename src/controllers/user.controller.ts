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
    userRepository: UserRepository

    constructor(UserModel: any) {
        this.userRepository = new UserRepository(UserModel)
    }

    /**
     * Add new user.
     * 
     * @param req Request.
     * @param res Response.
     * @returns any
     */
    addUser(req: Request, res: Response): any {
        req.body.change_password = false
        return this.userRepository.save(req.body)
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
        return this.userRepository.getAll(req.query)
            .then((users: Array<IUser>) => res.status(200).send(users))
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
        req.query.filters._id = req.params.user_id
        return this.userRepository
            .getById(req.query)
            .then((result: IUser) => res.status(200).send(result))
            .catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))
    }

    /**
     * Authenticate user.
     * 
     * @param req Request.
     * @param res Response.
     * @returns any
     */

    authUser(req: Request, res: Response): any {
        return this.userRepository
            .authenticate(req.body.user_name, req.body.password)
            .then(token => res.status(201).send(token))
            .catch((err: IExceptionError) => res.status(err.code).send(err.toJson()))
    }

}