import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IUserService } from '../port/user.service.interface'
import { IUserRepository } from '../port/user.repository.interface'
import { User, UserType } from '../domain/model/user'
import { IQuery } from '../port/query.interface'
import { UpdatePasswordValidator } from '../domain/validator/update.password.validator'
import { IEducatorService } from '../port/educator.service.interface'
import { IHealthProfessionalService } from '../port/health.professional.service.interface'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { IChildService } from '../port/child.service.interface'
import { IFamilyService } from '../port/family.service.interface'
import { IApplicationService } from '../port/application.service.interface'
import { ILogger } from '../../utils/custom.logger'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { ResetPasswordValidator } from '../domain/validator/reset.password.validator'
import { Strings } from '../../utils/strings'

/**
 * Implementing user Service.
 *
 * @implements {IUserService}
 */
@injectable()
export class UserService implements IUserService {

    constructor(@inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
                @inject(Identifier.EDUCATOR_SERVICE) private readonly _educatorService: IEducatorService,
                @inject(Identifier.CHILD_SERVICE) private readonly _childService: IChildService,
                @inject(Identifier.HEALTH_PROFESSIONAL_SERVICE)
                private readonly _healthProfessionalService: IHealthProfessionalService,
                @inject(Identifier.FAMILY_SERVICE) private readonly _familyService: IFamilyService,
                @inject(Identifier.APPLICATION_SERVICE) private readonly _applicationService: IApplicationService,
                @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                @inject(Identifier.LOGGER) private readonly _logger: ILogger) {
    }

    public async add(item: User): Promise<User> {
        throw Error('Not implemented!')
    }

    public async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
        // 1. Validate id.
        ObjectIdValidator.validate(userId, Strings.USER.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Validate passwords.
        UpdatePasswordValidator.validate(oldPassword, newPassword)

        // 3. Update user password.
        return this._userRepository.changePassword(userId, oldPassword, newPassword)
    }

    public async resetPassword(userId: string, newPassword: string): Promise<boolean> {
        // 1. Validate id.
        ObjectIdValidator.validate(userId, Strings.USER.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Validate passwords.
        ResetPasswordValidator.validate(newPassword)

        // 3. Reset user password.
        return this._userRepository.resetPassword(userId, newPassword)
    }

    public async getAll(query: IQuery): Promise<Array<User>> {
        throw Error('Not implemented!')
    }

    public async getById(id: string, query: IQuery): Promise<User> {
        throw Error('Not implemented!')
    }

    public async remove(id: string): Promise<boolean> {
        // 1. Validate id.
        ObjectIdValidator.validate(id, Strings.USER.PARAM_ID_NOT_VALID_FORMAT)

        // 2. Find a user by id.
        const user = await this._userRepository.findById(id)
        if (!user) return Promise.resolve(false)

        let userDel: boolean = false

        if (user && user.type) {
            // 3. Check the types of users to direct the deletion operation to their respective services.
            switch (user.type) {
                case UserType.EDUCATOR:
                    userDel = await this._educatorService.remove(id)
                    break
                case UserType.HEALTH_PROFESSIONAL:
                    userDel = await this._healthProfessionalService.remove(id)
                    break
                case UserType.FAMILY:
                    userDel = await this._familyService.remove(id)
                    break
                case UserType.CHILD:
                    userDel = await this._childService.remove(id)
                    break
                case UserType.APPLICATION:
                    userDel = await this._applicationService.remove(id)
                    break
                default:
                    break
            }
        }

        if (userDel) this.publishDeleteEvent({ id: user.id, type: user.type, username: user.username })
        return Promise.resolve(userDel)
    }

    public async update(item: User): Promise<User> {
        throw Error('Not implemented!')
    }

    private publishDeleteEvent(user: any): void {
        if (user) {
            this._eventBus.bus
                .pubDeleteUser(user)
                .then(() => {
                    this._logger.info(`User with ID: ${user.id} has been deleted and published on event bus...`)
                })
                .catch((err) => {
                    this._logger.error(`Error trying to publish event DeleteUser. ${err.message}`)
                })
        }
    }
}
