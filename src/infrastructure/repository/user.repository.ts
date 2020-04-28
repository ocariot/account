import bcrypt from 'bcryptjs'
import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { User } from '../../application/domain/model/user'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Identifier } from '../../di/identifiers'
import { UserEntity } from '../entity/user.entity'
import { IUserRepository } from '../../application/port/user.repository.interface'
import { IQuery } from '../../application/port/query.interface'
import { Query } from './query/query'
import { Strings } from '../../utils/strings'
import { ValidationException } from '../../application/domain/exception/validation.exception'

/**
 * Implementation of the user repository.
 *
 * @implements {IChildRepository}
 */
@injectable()
export class UserRepository extends BaseRepository<User, UserEntity> implements IUserRepository {
    constructor(
        @inject(Identifier.USER_REPO_MODEL) readonly userModel: any,
        @inject(Identifier.USER_ENTITY_MAPPER) readonly userMapper: IEntityMapper<User, UserEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(userModel, userMapper, logger)
    }

    public create(item: User): Promise<User> {
        // Encrypt password
        if (item.password) item.password = this.encryptPassword(item.password)
        return super.create(item)
    }

    public changePassword(userId: string, old_password: string, new_password: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.userModel.findOne({ _id: userId })
                .then((user) => {
                    if (!user) return resolve(false)
                    if (!this.comparePasswords(old_password, user.password)) {
                        return reject(new ValidationException(
                            Strings.USER.PASSWORD_NOT_MATCH,
                            Strings.USER.PASSWORD_NOT_MATCH_DESCRIPTION
                        ))
                    }
                    return resolve(this.resetPassword(userId, new_password))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public resetPassword(userId: string, new_password: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            new_password = this.encryptPassword(new_password)

            this.userModel.findOneAndUpdate({ _id: userId }, { password: new_password }, { new: true })
                .exec()
                .then(result => {
                    if (!result) return resolve(false)
                    return resolve(true)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public encryptPassword(password: string): string {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    }

    public comparePasswords(passwordPlain: string, passwordHash: string): boolean {
        return bcrypt.compareSync(passwordPlain, passwordHash)
    }

    public hasInstitution(institutionId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const query: IQuery = new Query()
            query.filters = { institution: institutionId }
            super.count(query)
                .then(value => {
                    return resolve(value > 0)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public findById(userId: string): Promise<User> {
        const query = new Query()
        query.addFilter({ _id: userId })
        return super.findOne(query)
    }

    public updateLastLogin(username: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const users: any = await this.find(new Query())
            let userId
            for (const user of users) {
                if (user.username === username) {
                    userId = user.id
                    break
                }
            }
            if (!userId) return resolve(false)

            this.userModel
                .findOneAndUpdate(
                    { _id: userId },
                    { last_login: new Date() }
                )
                .then(result => resolve(!!result))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }
}
