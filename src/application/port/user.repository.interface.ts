import { User } from '../domain/model/user'
import { IRepository } from './repository.interface'

/**
 * Interface of the User repository.
 * Must be implemented by the user repository at the infrastructure layer.
 *
 * @see {@link UserRepository} for further information.
 * @extends {IRepository<User>}
 */
export interface IUserRepository extends IRepository<User> {

    /**
     * Retrieves the educator according to ID.
     *
     * @param userId
     * @return {Promise<Educator>}
     * @throws {ValidationException | RepositoryException}
     */
    findById(userId: string): Promise<User>

    /**
     * Change the user password.
     *
     * @param userId
     * @param oldPassword
     * @param newPassword
     * @return {Promise<boolean>} True if the password was changed or False, otherwise.
     * @throws {ValidationException | RepositoryException}
     */
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean>

    /**
     * Reset the user password.
     *
     * @param userId
     * @param newPassword
     * @return {Promise<boolean>} True if the password was changed or False, otherwise.
     * @throws {ValidationException | RepositoryException}
     */
    resetPassword(userId: string, newPassword: string): Promise<boolean>

    /**
     * Encrypt the user password
     *
     * @param password
     * @return {string} Encrypted password if the encrypt was successfully.
     */
    encryptPassword(password: string): string

    /**
     * Compare if two passwords match.,
     *
     * @param passwordPlain
     * @param passwordHash
     * @return True if the passwords matches, false otherwise.
     */
    comparePasswords(passwordPlain: string, passwordHash: string): boolean

    /**
     * Verify if a institution is associated with one or more users.
     *
     * @param institutionId
     * @return True if the institution is associated with one or more users, false otherwise.
     */
    hasInstitution(institutionId: string): Promise<boolean>

    /**
     *  Update last login.
     *
     * @param userId
     */
    updateLastLogin(userId: string): Promise<boolean>
}
