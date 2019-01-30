import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IUserService } from '../port/user.service.interface'
import { IUserRepository } from '../port/user.repository.interface'
import { User } from '../domain/model/user'
import { IQuery } from '../port/query.interface'
import { UpdatePasswordValidator } from '../domain/validator/update.password.validator'
import { IEducatorService } from '../port/educator.service.interface'
import { IHealthProfessionalService } from '../port/health.professional.service.interface'

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
                private readonly _healthProfessionalService: IHealthProfessionalService) {
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
        const user = await this._userRepository.findById(id)
        if (user.type === 'educator') {
            return this._educatorService.remove(id)
        } else if (user.type === 'healthprofessional') {
            return this._healthProfessionalService.remove(id)
        }
        return this._userRepository.delete(id)
    }

    public async update(item: User): Promise<User> {
        throw Error('Not implemented!')
    }
}
