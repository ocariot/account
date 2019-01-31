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

/**
 * Implementing user Service.
 *
 * @implements {IUserService}
 */
@injectable()
export class UserService implements IUserService {

    constructor(@inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
                @inject(Identifier.EDUCATOR_SERVICE) private readonly _educatorService: IEducatorService,
                @inject(Identifier.HEALTH_PROFESSIONAL_SERVICE)
                private readonly _healthProfessionalService: IHealthProfessionalService,
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

        // 2. Delete a user by id.
        const isDeleted: boolean = await this._userRepository.delete(id)

        if (isDeleted && user && user.type) {
            // 3. Check the types of users to direct the deletion operation to their respective services.
            if (user.type === UserType.EDUCATOR) await this._educatorService.remove(id)
            else if (user.type === UserType.HEALTH_PROFESSIONAL) await this._healthProfessionalService.remove(id)

            // 4. Publish a deleted user in successful delete.
            switch (user.type) {
                case UserType.EDUCATOR:
                    this._eventBus.publish(
                        new UserDeleteEvent('EducatorDeleteEvent',
                            new Date(), user), 'educators.delete'
                    )
                    break
                case UserType.HEALTH_PROFESSIONAL:
                    this._eventBus.publish(
                        new UserDeleteEvent('HealthProfessionalDeleteEvent',
                            new Date(), user), 'healthprofessionals.delete'
                    )
                    break
                case UserType.FAMILY:
                    this._eventBus.publish(
                        new UserDeleteEvent('FamilyDeleteEvent',
                            new Date(), user), 'families.delete'
                    )
                    break
                case UserType.CHILD:
                    this._eventBus.publish(
                        new UserDeleteEvent('ChildDeleteEvent',
                            new Date(), user), 'children.delete'
                    )
                    break
                case UserType.APPLICATION:
                    this._eventBus.publish(
                        new UserDeleteEvent('ApplicationDeleteEvent',
                            new Date(), user), 'applications.delete'
                    )
                    break
                default:
                    break
            }
        }

        return Promise.resolve(isDeleted)
    }

    public async update(item: User): Promise<User> {
        throw Error('Not implemented!')
    }
}
