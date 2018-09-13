import { IFirebase } from '../models/firebase'
import { resolve } from 'path'
import { ApiException } from './../exceptions/api.exception'
import { IProfileRepository } from './repository.interface'

/**
 * Class to manipulate the data of the User entity.
 * 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
export class FirebaseProfileRepository implements IProfileRepository<IFirebase> {
    FirebaseModel: any
    removeFields: Object

    /**
     * Constructor.
     * 
     * @param model
     */
    constructor(model: any) {
        this.FirebaseModel = model
        this.removeFields = { __v: false, updated_at: false }
    }

    /**
     * Save new user.
     * 
     * @param item Object to be saved. 
     */
    save(item: IFirebase): Promise<IFirebase> {
        return new Promise((resolve, reject) => {
            this.FirebaseModel.create(item)
                .then((user: IFirebase) => user)
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
    getAll(params?: Object): Promise<IFirebase[]> {
        return new Promise((resolve, reject) => {
            this.FirebaseModel.find({}, this.removeFields)
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
        throw new Error("Method not implemented.")
        return new Promise((resolve, reject) => {
            this.FirebaseModel.findByIdAndDelete(id)
            .then((user: IFirebase) => {
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
    update(id: string, item: IFirebase): Promise<IFirebase> {
        throw new Error("Method not implemented.")
        return new Promise((resolve, reject) => {
            this.FirebaseModel.findByIdAndUpdate(id, item)
            .then((user: IFirebase) => {
                if (!user) return reject(new ApiException(404, 'User not found!'))

                resolve(user)
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
    getById(id: string, params?: Object): Promise<IFirebase[]> {
        return new Promise((resolve, reject) => {
            this.FirebaseModel.find({user_id: id}, this.removeFields)
                .then((profile: IFirebase[]) => {
                    if (profile.length == 0) return reject(new ApiException(404, 'User not found!'))

                    resolve(profile)
                }).catch((err: any) => {
                    if (err.name == 'CastError')
                        return reject(new ApiException(400, 'Invalid parameter!', err.message))

                    reject(new ApiException(500, err.message))
                })
        })
    }

    getToken(id: string): Promise<string> {
        throw new Error("Method not implemented.")
    }

    /////////////////////////////////////////////////////////////////////

    
}
