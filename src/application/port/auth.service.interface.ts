/**
 * Auth service interface.
 */
export interface IAuthService {
    /**
     * Authenticate the user.
     *
     * @param username
     * @param password
     * @return {Promise<object>}
     * @throws {ValidationException | RepositoryException}
     */
    authenticate(username: string, password: string): Promise<object>
}
