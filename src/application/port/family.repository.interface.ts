import { IRepository } from './repository.interface'
import { Family } from '../domain/model/family'

/**
 * Interface of the family repository.
 * Must be implemented by the user repository at the infrastructure layer.
 *
 * @see {@link IFamilyRepository} for further information.
 * @extends {IRepository<Family>}
 */
export interface IFamilyRepository extends IRepository<Family> {
    /**
     * Checks if an family already has a registration.
     * What differs from one user to another is the username.
     *
     * @param family
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(family: Family): Promise<boolean>
}
