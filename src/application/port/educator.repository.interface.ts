import { IRepository } from './repository.interface'
import { Educator } from '../domain/model/educator'

/**
 * Interface of the Educator repository.
 * Must be implemented by the user repository at the infrastructure layer.
 *
 * @see {@link EducatorRepository} for further information.
 * @extends {IRepository<Educator>}
 */
export interface IEducatorRepository extends IRepository<Educator> {

    /**
     * Retrieves the educator according to ID.
     *
     * @param educatorId
     * @return {Promise<Educator>}
     * @throws {ValidationException | RepositoryException}
     */
    findById(educatorId: string): Promise<Educator>

    /**
     * Checks if educator already has a registration.
     * If the object to be verified has id, it will be considered
     * as character in the verification, otherwise the username will be used.
     *
     * @param educator
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(educator: Educator): Promise<boolean>
}
