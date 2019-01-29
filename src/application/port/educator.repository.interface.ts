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
     * Checks if educator already has a registration.
     *
     * @param educator
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(educator: Educator): Promise<boolean>
}
