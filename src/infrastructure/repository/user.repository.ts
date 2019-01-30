import bcrypt from 'bcryptjs'
import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { User } from '../../application/domain/model/user'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Identifier } from '../../di/identifiers'
import { UserEntity } from '../entity/user.entity'
import { IUserRepository } from '../../application/port/user.repository.interface'
import { ChangePasswordException } from '../../application/domain/exception/change.password.exception'
import { Strings } from '../../utils/strings'

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
                        return reject(new ChangePasswordException(
                            Strings.USER.PASSWORD_NOT_MATCH,
                            Strings.USER.PASSWORD_NOT_MATCH_DESCRIPTION
                        ))
                    }
                    user.password = this.encryptPassword(new_password)
                    user.change_password = false
                    this.userModel.findOneAndUpdate({ _id: user.id }, user, { new: true })
                        .exec()
                        .then(result => {
                            if (!result) return resolve(false)
                            return resolve(true)
                        })
                        .catch(err => reject(super.mongoDBErrorListener(err)))
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
}
