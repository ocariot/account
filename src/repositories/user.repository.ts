import { IUser, User } from '../models/user'
import { ApiException } from './../exceptions/api.exception'
import { IUserRepository } from './repository.interface'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import config from './../../config/config'

/**
 * Class to manipulate the data of the User entity.
 * 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
export class UserRepository implements IUserRepository<IUser> {
    UserModel: any

    /**
     * Constructor.
     * 
     * @param model
     */
    constructor(model: any) {
        this.UserModel = model
    }

    /**
     * Save new user.
     * 
     * @param item Object to be saved. 
     */
    save(item: IUser): Promise<IUser> {
        item.password = this.encryptPassword(item.password)
        return new Promise((resolve, reject) => {
            this.UserModel.create(item)
                .then((user: IUser) => user)
                .then((user) => {
                    resolve(user.toJSON())
                })
                .catch((err: any) => {
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
    getAll(q?: any): Promise<IUser[]> {
        return new Promise((resolve, reject) => {
            this.UserModel.find(q.filters)
                .select(q.fields)
                .sort(q.ordination)
                .skip(Number((q.pagination.limit * q.pagination.page) - q.pagination.limit))
                .limit(Number(q.pagination.limit))
                .exec() // execute query
                .then(users => {
                    if (users.length == 0)
                        return reject(new ApiException(404, 'Users not found!'))
                    resolve(users)
                })
                .catch((err: any) => {
                    if (err.name === 'CastError')
                        return reject(new ApiException(400, 'Invalid parameter!', err.message))
                    reject(new ApiException(500, 'Internal Error', err.toJSON()))
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
                })
                .catch((err: any) => {
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
    update(item: any): Promise<IUser> {
        //throw new Error("Method not implemented.")
        return new Promise((resolve, reject) => {
            this.UserModel.findOneAndUpdate({ _id: item.id }, item, { new: true })
                .exec()
                .then((user: IUser) => {
                    if (!user) return reject(new ApiException(404, 'User not found!'))
                    resolve(user.toJSON())
                })
                .catch((err: any) => {
                    if (err.code === 11000)
                        return reject(new ApiException(409, 'Duplicate data is not allowed!'))
                    else if (err.name == 'CastError')
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
    getById(query?: any): Promise<IUser> {
        return new Promise((resolve, reject) => {
            this.UserModel.findOne(query.filters)
                .select(query.fields)
                .then((user: IUser) => {
                    if (!user) return reject(new ApiException(404, 'User not found!'))
                    resolve(user.toJSON())
                })
                .catch((err: any) => {
                    if (err.name == 'CastError')
                        return reject(new ApiException(400, 'Invalid parameter!', err.message))
                    reject(new ApiException(500, err.message))
                })
        })
    }

    /**
     * Authenticate a user.
     *
     * @param email
     * @param password
     * @return {Promise<object>} True if the password was changed or False, otherwise.
     * @throws {ChangePasswordExeption}
     */
    public authenticate(user_name: string, password: string): Promise<object> {
        return new Promise<object>((resolve, reject) => {
            return this.UserModel.findOne({ user_name: user_name })
                .then(user => {
                    if (!user || !this.comparePasswords(password, user.password)) {
                        return reject(
                            new ApiException(404,
                                'User not found.',
                                'User not found or already removed. A new operation for the same ' +
                                'resource is not required!'))
                    }

                    if (user.change_password) {
                        return reject(
                            new ApiException(
                                403,
                                'Change password is necessary.',
                                `To ensure information security, the user must change the access password.` +
                                `To change it, access PATCH /api/v1/users/${user._id}/password.`,
                                `/api/v1/users/${user._id}/password`))
                    }
                    resolve(this.generateToken(user))
                })
                .catch(err => {
                    if (err.name == 'CastError')
                        return reject(new ApiException(400, 'Invalid parameter!', err.message))
                    reject(new ApiException(500, err.message))
                })
        })
    }

    /**
     * Encrypt the user password.
     *
     * @param password
     * @return {string} Encrypted password if the encrypt was successfully.
     */
    public encryptPassword(password: string | undefined): string {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    /**
     * Compare if two passwords match.
     *
     * @param password_one The not hash password
     * @param password_two The hash password
     * @return True if the passwords matches, false otherwise.
     */
    public comparePasswords(password_one: string, password_two: string | undefined): boolean {
        return bcrypt.compareSync(password_one, password_two)
    }
    /**
     * Generate a token by user data.
     *
     * @param user
     * @return {token} The generated token.
     */
    public generateToken(user: any): object {

        const payload: any = {
            sub: user._id,
            iss: 'ocariot',
            iat: Math.round(Date.now() / 1000),
            exp: Math.round(Date.now() / 1000 + 24 * 60 * 60)
        }

        payload.scope = 'activities:read activities:register:remove'

        const secret: string = process.env.JWT_SECRET || config.JWT_SECRET
        const userToken: object = { token: jwt.sign(payload, secret) }

        return userToken
    }

}
