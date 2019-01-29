import { IRepository } from './repository.interface'
import { Application } from '../domain/model/application'

/**
 * Interface of the User Application repository.
 * Must be implemented by the user repository at the infrastructure layer.
 *
 * @see {@link ApplicationRepository} for further information.
 * @extends {IRepository<Application>}
 */
export interface IApplicationRepository extends IRepository<Application> {
    /**
     * Checks if an user application already has a registration.
     * If the object to be verified has id, it will be considered
     * as character in the verification, otherwise the username will be used.
     *
     * @param application
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(application: Application): Promise<boolean>
}
