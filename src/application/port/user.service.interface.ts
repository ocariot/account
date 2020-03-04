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

    /**
     * Replaces the scopes of all users according to the type.
     *
     * @param userType - User type.
     * @param newScopes - New list of scopes to be inserted in the user.
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    replaceScopes(userType: string, newScopes: Array<string>): Promise<boolean>
}
