import { IRepository } from './repository.interface'
import { Family } from '../domain/model/family'

/**
 * Interface of the family repository.
 * Must be implemented by the user repository at the infrastructure layer.
 *
 * @see {@link FamilyRepository} for further information.
 * @extends {IRepository<Family>}
 */
export interface IFamilyRepository extends IRepository<Family> {

    /**
     * Retrieves the family according to ID.
     *
     * @param familyId
     * @return {Promise<Family>}
     * @throws {ValidationException | RepositoryException}
     */
    findById(familyId: string): Promise<Family>

    /**
     * Checks if an family already has a registration.
     * What differs from one user to another is the username.
     * If the object to be verified has id, it will be considered
     * as character in the verification, otherwise the username will be used.
     *
     * @param family
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(family: Family): Promise<boolean>

    /**
     * Disassociate a child from a family.
     *
     * @param childId
     * @return {Promise<boolean>} True if the disassociation was done, false otherwise.
     * @throws {ValidationException | RepositoryException}
     */
    disassociateChildFromFamily(childId: string): Promise<boolean>
}
