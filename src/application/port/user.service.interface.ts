import { IService } from './service.interface'
import { User } from '../domain/model/user'

/**
 * User service interface.
 *
 * @extends {IService<User>}
 */
export interface IUserService extends IService<User> {
    /**
     * Change the user password.
     *
     * @param userId - Unique identifier.
     * @param oldPassword - Old user password.
     * @param newPassword - New user password.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean>

    /**
     * Reset the user password.
     *
     * @param userId - Unique identifier.
     * @param newPassword - New user password.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    resetPassword(userId: string, newPassword: string): Promise<boolean>
}
