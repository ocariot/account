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
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'
import { ILogger } from '../../utils/custom.logger'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'

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
                @inject(Identifier.INTEGRATION_EVENT_REPOSITORY)
                private readonly _integrationEventRepository: IIntegrationEventRepository,
                @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                @inject(Identifier.LOGGER) private readonly _logger: ILogger) {
    }

    public async add(item: User): Promise<User> {
        throw Error('Not implemented!')
    }

    public async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
        // 1. Validate id.
        ObjectIdValidator.validate(userId)

        // 2. Validate passwords.
        UpdatePasswordValidator.validate(oldPassword, newPassword)

        // 3. Update user password.
        return this._userRepository.changePassword(userId, oldPassword, newPassword)
    }

    public async getAll(query: IQuery): Promise<Array<User>> {
        return this._userRepository.find(query)
    }

    public async getById(id: string, query: IQuery): Promise<User> {
        // 1. Validate id.
        ObjectIdValidator.validate(id)

        // 2. Get a user.
        query.addFilter({ _id: id })
        return this._userRepository.findOne(query)
    }

    public async remove(id: string): Promise<boolean> {
        // 1. Validate id.
        ObjectIdValidator.validate(id)

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

        if (userDel) await this.publishDeleteEvent(user)
        return Promise.resolve(userDel)
    }

    public async update(item: User): Promise<User> {
        throw Error('Not implemented!')
    }

    private async publishDeleteEvent(user: User): Promise<void> {
        if (user) {
            const event: UserDeleteEvent = new UserDeleteEvent('UserDeleteEvent',
                new Date(), user)
            if (!(await this._eventBus.publish(event, 'users.delete'))) {
                // Save Event for submission attempt later when there is connection to message channel.
                this.saveEvent(event)
            } else {
                this._logger.info(`User with ID: ${user.id} has been deleted and published on event bus...`)
            }
        }
    }

    /**
     * Saves the event to the database.
     * Useful when it is not possible to run the event and want to perform the
     * operation at another time.
     * @param event
     */
    private saveEvent(event: UserDeleteEvent): void {
        const saveEvent: any = event.toJSON()
        saveEvent.__operation = 'publish'
        saveEvent.__routing_key = 'users.delete'
        this._integrationEventRepository
            .create(JSON.parse(JSON.stringify(saveEvent)))
            .then(() => {
                this._logger.warn(`Could not publish the event named ${event.event_name}.`
                    .concat(` The event was saved in the database for a possible recovery.`))
            })
            .catch(err => {
                this._logger.error(`There was an error trying to save the name event: ${event.event_name}.`
                    .concat(`Error: ${err.message}. Event: ${JSON.stringify(saveEvent)}`))
            })
    }
}
