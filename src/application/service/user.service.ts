import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IUserService } from '../port/user.service.interface'
import { IUserRepository } from '../port/user.repository.interface'
import { User, UserType } from '../domain/model/user'
import { IQuery } from '../port/query.interface'
import { UpdatePasswordValidator } from '../domain/validator/update.password.validator'
import { IEducatorService } from '../port/educator.service.interface'
import { IHealthProfessionalService } from '../port/health.professional.service.interface'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { UserDeleteEvent } from '../integration-event/event/user.delete.event'
import { IChildService } from '../port/child.service.interface'
import { IFamilyService } from '../port/family.service.interface'
import { IApplicationService } from '../port/application.service.interface'

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
                @inject(Identifier.RABBITMQ_EVENT_BUS) readonly _eventBus: IEventBus) {
    }

    public async add(item: User): Promise<User> {
        throw Error('Not implemented!')
    }

    public async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
        UpdatePasswordValidator.validate(oldPassword, newPassword)
        return this._userRepository.changePassword(userId, oldPassword, newPassword)
    }

    public async getAll(query: IQuery): Promise<Array<User>> {
        return this._userRepository.find(query)
    }

    public async getById(id: string | number, query: IQuery): Promise<User> {
        query.addFilter({ _id: id })
        return this._userRepository.findOne(query)
    }

    public async remove(id: string): Promise<boolean> {
        // 1. Find a user by id.
        const user = await this._userRepository.findById(id)
        if (!user) return Promise.resolve(false)

        let userDel: boolean = false

        if (user && user.type) {
            // 2. Check the types of users to direct the deletion operation to their respective services.
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

        if (userDel) this.publishDeleteEvent(user)
        return Promise.resolve(userDel)
    }

    public async update(item: User): Promise<User> {
        throw Error('Not implemented!')
    }

    private publishDeleteEvent(user: User) {
        this._eventBus.publish(
            new UserDeleteEvent('UserDeleteEvent',
            new Date(), user), 'users.delete')
    }
}
