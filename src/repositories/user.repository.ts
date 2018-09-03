import { IUser, User } from '../models/user'
import { resolve } from 'path'
import { ApiException } from './../exceptions/api.exception'
import { IUserRepository } from './repository.interface'
import jwt from "jwt-simple"
import config from './../../config/config'

/**
 * Class to manipulate the data of the User entity.
 * 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
export class UserRepository implements IUserRepository<IUser> {
    UserModel: any
    removeFields: Object

    /**
     * Constructor.
     * 
     * @param model
     */
    constructor(model: any) {
        this.UserModel = model
        this.removeFields = { __v: false, updated_at: false, _id: false }
    }

    /**
     * Save new user.
     * 
     * @param item Object to be saved. 
     */
    save(item: IUser): Promise<IUser> {
        return new Promise((resolve, reject) => {
            this.UserModel.create(item)
                .then((user: IUser) => user)
                .then((user) => {
                    user.__v = undefined
                    user.updated_at = undefined

                    resolve(user)
                }).catch((err: any) => {
                    if (err.name == 'ValidationError')
                        return reject(new ApiException(400, 'Required fields were not included!', err.message))
                    if (err.code === 11000)
                        return reject(new ApiException(409, 'Duplicate data is not allowed!'))

                    reject(new ApiException(500, err.message))
                })
        })
    }

    /**
     * List all users.
     * 
     * @param params 
     */
    getAll(params?: Object): Promise<IUser[]> {
        return new Promise((resolve, reject) => {
            this.UserModel.find({}, this.removeFields)
                .then(users => {
                    if (users.length == 0)
                        return reject(new ApiException(404, 'Users not found!'))

                    resolve(users)
                })
        })
    }

    /**
* Delete user from Database.
* 
* @param id User ID
*/
    delete(id: string): Promise<boolean> {
        //throw new Error("Method not implemented.")
        return new Promise((resolve, reject) => {
            this.UserModel.findByIdAndDelete(id)
                .then((user: IUser) => {
                    if (!user) return reject(new ApiException(404, 'User not found!'))

                    resolve(true)
                }).catch((err: any) => {
                    if (err.name == 'CastError')
                        return reject(new ApiException(400, 'Invalid parameter!', err.message))

                    reject(new ApiException(500, err.message))
                })

        })
    }

    /**
 * Update user data.
 * 
 * @param id User ID
 * @param item Object to be updated.  
 */
    update(id: string, item: Object): Promise<IUser> {
        //throw new Error("Method not implemented.")
        return new Promise((resolve, reject) => {
            this.UserModel.findByIdAndUpdate(id, item, this.removeFields)
                .then((user: IUser) => {
                    if (!user) return reject(new ApiException(404, 'User not found!'))

                    let result: IUser = Object.assign(user, item).toJSON()

                    delete result._id;
                    delete result.__v;
                    delete result.updated_at;

                    resolve(result)
                }).catch((err: any) => {
                    if (err.name == 'CastError')
                        return reject(new ApiException(400, 'Invalid parameter!', err.message))

                    reject(new ApiException(500, err.message))
                })

        })
    }

    /**
     * List user data.
     * 
     * @param id User ID
     * @param params 
     */
    getById(id: string, params?: Object): Promise<IUser> {
        return new Promise((resolve, reject) => {
            this.UserModel.findById(id, this.removeFields)
                .then((user: IUser) => {
                    if (!user) return reject(new ApiException(404, 'User not found!'))

                    resolve(user)
                }).catch((err: any) => {
                    if (err.name == 'CastError')
                        return reject(new ApiException(400, 'Invalid parameter!', err.message))

                    reject(new ApiException(500, err.message))
                })
        })
    }

    getToken(req_user_name: string, req_password: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.UserModel.findOne({ user_name: req_user_name, password: req_password })
                .then((user: IUser) => {
                    if (!user) return reject(new ApiException(404, 'User not found!'))

                    let payload = {
                        sub: user._id,
                        iss: "ocariot",
                        iat: Math.round(Date.now() / 1000),
                        exp: Math.round(Date.now() / 1000 + 24 * 60 * 60),
                        scope: "activities:read activities:register activities:remove users:readAll users:register users:read users:update users:remove"
                    }
                    
                    resolve({ access_token: jwt.encode(payload, config.jwtSecret) })
                }).catch((err: any) => {
                    if (err.name == 'CastError')
                        return reject(new ApiException(400, 'Invalid parameter!', err.message))

                    reject(new ApiException(500, err.message))
                })
        })
    }

    /////////////////////////////////////////////////////////////////////


}
