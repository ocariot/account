import { IRepository } from './repository.interface'
import { Institution } from '../domain/model/institution'

/**
 * Interface of the institution repository.
 * Must be implemented by the user repository at the infrastructure layer.
 *
 * @see {@link InstitutionRepository} for further information.
 * @extends {IRepository<User>}
 */
export interface IInstitutionRepository extends IRepository<Institution> {
    /**
     * Checks if an institution already has a registration.
     * What differs from one user to another is the username.
     *
     * @param institution
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(institution: Institution): Promise<boolean>
}
