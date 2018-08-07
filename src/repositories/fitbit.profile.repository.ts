import { IFitbit } from '../models/fitbit'
import { resolve } from 'path'
import { ApiException } from './../exceptions/api.exception'
import { IProfileRepository } from './repository.interface'

import { UserRepository } from '../repositories/user.repository'
import { User } from '../models/user';

/**
 * Class to manipulate the data of the User entity.
 * 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
export class FitibitProfileRepository implements IProfileRepository<IFitbit> {
    FitbitModel: any
    userRepository: UserRepository
    removeFields: Object

    /**
     * Constructor.
     * 
     * @param model
     */
    constructor(model: any) {
        this.userRepository = new UserRepository(User)
        this.FitbitModel = model
        this.removeFields = { __v: false, updated_at: false }
    }

    /**
     * Save new user.
     * 
     * @param item Object to be saved. 
     */
    save(item: IFitbit): Promise<IFitbit> {
        return new Promise((resolve, reject) => {
            this.userRepository.getById(item.user_id)
            .then(() => {
                this.FitbitModel.create(item)
                    .then((profile: IFitbit) => profile)
                    .then((profile) => {
                        profile.__v = undefined
                        profile.updated_at = undefined

                        resolve(profile)
                    }).catch((err: any) => {
                        if (err.name == 'ValidationError')
                            return reject(new ApiException(400, 'Required fields were not included!', err.message))
                        if (err.code === 11000)
                            return reject(new ApiException(409, 'Duplicate data is not allowed!'))

                        reject(new ApiException(500, err.message))
                    })
                })
            .catch((err: any) =>  {return reject(new ApiException(404, 'User not found!'))})
        })  
    }

    /**
     * List all users.
     * 
     * @param params 
     */
    getAll(params?: Object): Promise<IFitbit[]> {
        return new Promise((resolve, reject) => {
            this.FitbitModel.find({}, this.removeFields)
                .then(profiles => {
                    if (profiles.length == 0)
                        return reject(new ApiException(404, 'Profiles not found!'))

                    resolve(profiles)
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
            this.FitbitModel.findByIdAndDelete(id)
            .then((user: IFitbit) => {
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
     * List user data.
     * 
     * @param id User ID
     * @param params 
     */
    getById(id: string, params?: Object): Promise<IFitbit[]> {
        return new Promise((resolve, reject) => {
            this.FitbitModel.find({user_id: id}, this.removeFields)
                .then((fitibProfile: IFitbit[]) => {
                    if (fitibProfile.length == 0) return reject(new ApiException(404, 'Fitibit Profiles not found!'))

                    resolve(fitibProfile)
                }).catch((err: any) => {
                    if (err.name == 'CastError')
                        return reject(new ApiException(400, 'Invalid parameter!', err.message))

                    reject(new ApiException(500, err.message))
                })
        })
    }

    /////////////////////////////////////////////////////////////////////

    
}
